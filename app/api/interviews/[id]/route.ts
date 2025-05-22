import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const interviewId = params.id

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user type
    const { data: userData, error: userDataError } = await supabase
      .from("users")
      .select("user_type")
      .eq("id", user.id)
      .single()

    if (userDataError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get interview with related data
    const { data: interview, error: interviewError } = await supabase
      .from("interviews")
      .select(`
        *,
        applications (
          id,
          job_id,
          applicant_id,
          status,
          cover_letter,
          video_url,
          ai_score,
          ai_feedback,
          jobs (
            id,
            title,
            description,
            location,
            remote_policy,
            job_type,
            companies (
              name,
              logo_url,
              industry,
              location,
              website
            )
          ),
          applicants (
            id,
            headline,
            bio,
            location,
            resume_url,
            profile_picture_url,
            users (
              first_name,
              last_name,
              email
            )
          )
        )
      `)
      .eq("id", interviewId)
      .single()

    if (interviewError) {
      return NextResponse.json({ error: interviewError.message }, { status: 400 })
    }

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 })
    }

    // Check if user has permission to view this interview
    if (userData.user_type === "applicant") {
      // Get applicant ID
      const { data: applicantData, error: applicantError } = await supabase
        .from("applicants")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (applicantError || !applicantData) {
        return NextResponse.json({ error: "Applicant profile not found" }, { status: 404 })
      }

      // Check if interview is for this applicant
      if (interview.applications.applicant_id !== applicantData.id) {
        return NextResponse.json({ error: "You are not authorized to view this interview" }, { status: 403 })
      }
    } else if (userData.user_type === "hirer") {
      // Get hirer's company ID
      const { data: hirerData, error: hirerError } = await supabase
        .from("hirers")
        .select("company_id")
        .eq("user_id", user.id)
        .single()

      if (hirerError || !hirerData) {
        return NextResponse.json({ error: "Hirer profile not found" }, { status: 404 })
      }

      // Check if job belongs to hirer's company
      if (interview.applications.jobs.companies.id !== hirerData.company_id) {
        return NextResponse.json({ error: "You are not authorized to view this interview" }, { status: 403 })
      }
    }

    return NextResponse.json({ interview })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    const interviewId = params.id
    const body = await request.json()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Get user type
    const { data: userData, error: userDataError } = await supabase
      .from("users")
      .select("user_type")
      .eq("id", user.id)
      .single()

    if (userDataError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Only hirers can update interviews
    if (userData.user_type !== "hirer") {
      return NextResponse.json({ error: "Only hirers can update interviews" }, { status: 403 })
    }

    // Get hirer's company ID
    const { data: hirerData, error: hirerError } = await supabase
      .from("hirers")
      .select("company_id")
      .eq("user_id", user.id)
      .single()

    if (hirerError || !hirerData) {
      return NextResponse.json({ error: "Hirer profile not found" }, { status: 404 })
    }

    // Get interview to check permissions
    const { data: interview, error: interviewError } = await supabase
      .from("interviews")
      .select(`
        *,
        applications (
          jobs (
            companies (
              id
            )
          )
        )
      `)
      .eq("id", interviewId)
      .single()

    if (interviewError || !interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 })
    }

    // Check if job belongs to hirer's company
    if (interview.applications.jobs.companies.id !== hirerData.company_id) {
      return NextResponse.json({ error: "You are not authorized to update this interview" }, { status: 403 })
    }

    // Update interview
    const { data: updatedInterview, error: updateError } = await supabase
      .from("interviews")
      .update(body)
      .eq("id", interviewId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    return NextResponse.json({ interview: updatedInterview })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
