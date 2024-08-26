import supabaseClient, { supabaseUrl } from "@/utils/supabase";

export async function applyToJob(token, _, jobData) {
    const supabase = await supabaseClient(token);

    // Fetch job details to get CGPA criteria
    const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('cgpa_criteria')
        .eq('id', jobData.job_id)
        .single();

    if (jobError) {
        console.error("Error Fetching Job Details:", jobError);
        return null;
    }

    // Check if the candidate's CGPA meets the job's CGPA criteria
    if (job.cgpa_criteria && jobData.cgpa < job.cgpa_criteria) {
        return { error: `Your CGPA must be at least ${job.cgpa_criteria} to apply for this job.` };
    }

  const random = Math.floor(Math.random() * 90000);
  const fileName = `resume-${random}-${jobData.candidate_id}`;
    
  const { error: storageError } = await supabase.storage
    .from("resumes")
    .upload(fileName, jobData.resume);

  if (storageError) {
    console.error("Error Uploading Resume:", storageError);
    return null;
}
    
const supabaseUrl = 'https://xuajqamkbsnbkorwozmp.supabase.co';
const resume = `${supabaseUrl}/storage/v1/object/public/resumes/${fileName}`; 
//console.log(resume);

  const { data, error } = await supabase
    .from("applications")
    .insert([
      {
        ...jobData,
        resume,
      },
    ])
    .select();

  if (error) {
    console.error("Error Submitting Application:", error);
    return null;
  }

  return data;
}

// Updating applications status
export async function updateApplicationsStatus(token, { job_id }, status) {
    const supabase = await supabaseClient(token);

    const { data, error } = await supabase.from("applications").update({status}).eq("job_id",job_id).select();
    if (error || data.length === 0) {
        console.error("Error Updating Application Status:", error);
        return null;
    }
    return data;

}

export async function getApplications(token, { user_id }) {
    const supabase = await supabaseClient(token);

    const { data, error } = await supabase
        .from("applications")
        .select('*, job:jobs(title, company:companies(name))')
        .eq("candidate_id", user_id);

    if (error) {
        console.error("Error Fetching Applications:", error);
        return null;
    }
    return data;
    
}