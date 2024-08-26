import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import React, { useEffect } from 'react'
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BarLoader } from "react-spinners";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addNewJob } from "@/api/apiJobs";
import { State } from "country-state-city";
import useFetch from "@/hooks/use-fetch";
import { getCompanies } from "@/api/apiCompanies";
import { useUser } from "@clerk/clerk-react";
import { Navigate, useNavigate } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import AddCompanyDrawer from "@/components/add-company-drawer";

// creating a form using ZOD
const schema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  location: z.string().min(1, { message: "Select a location" }),
  company_id : z.string().min(1, { message: "Select or Add a new Company" }),
  requirements: z.string().min(1, { message: "Requirements are required" }),
  cgpa_criteria: z.number().min(0, { message: "CGPA must be a positive number" }).max(10, { message: "CGPA must be between 0 and 10" }).optional(),
});
  

const PostJob = () => {
  const { isLoaded, user } = useUser();
  const navigate = useNavigate();

  const {register, control, handleSubmit, reset, formState: {errors} } = useForm({
    defaultValues: {
      location: "",
      company_id: "",
      requirements: "",
      cgpa_criteria: undefined,
    },
    resolver : zodResolver(schema),
  });

  const { fn: fnCompanies, data: companies ,loading:loadingCompanies} = useFetch(getCompanies);

  useEffect(() => {
    if (isLoaded) fnCompanies();
  }, [isLoaded]);

  const { loading: loadingCreateJob, error: errorCreateJob, data: dataCreateJob, fn: fnCreatJob } = useFetch(addNewJob);

  const onSubmit = (data) => {
    fnCreatJob({
      ...data, recruiter_id: user.id, isOpen: true,
    });
  }

  useEffect(() => {
    if (dataCreateJob?.length > 0) navigate('/jobs');
    
  },[loadingCreateJob])

  

  if (!isLoaded || loadingCompanies) {
    return <BarLoader className="mb-4" width={"100%"} color="#36d7b7"></BarLoader>
  }

  if (user?.unsafeMetadata?.role !== "recruiter") {
    return <Navigate to="/jobs"/>
  }

  return (
    <div>
      <h1 className="gradient-title font-extrabold text-5xl sm:text-7xl text-center pb-8">Post a Job</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-4 pb-0">

        <Input placeholder="Job Title" {...register("title")} />
        {errors.title && <p className="text-red-500">{errors.title.message}</p>}

        <Textarea placeholder="Job Description" {...register("description")} />
        {errors.description && (<p className="text-red-500">{errors.description.message}</p>)}
       
        
  

        <div className="flex flex-col md:flex-row flex-wrap gap-4 items-center">

      {/* cgpa shortlisting features */}
        <Input placeholder="Enter CGPA Criteria (0-10)" type="number" step="0.1" {...register("cgpa_criteria",{ valueAsNumber: true })} />
        {errors.cgpa_criteria && <p className="text-red-500">{errors.cgpa_criteria.message}</p>}
          

        <Controller name="location" control={control} render={({ field }) => (

          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Location" />
              </SelectTrigger>
              <SelectContent>
                  <SelectGroup>
                      {State.getStatesOfCountry("IN").map(({ name }) => {
                          return(
                              <SelectItem value={name} key={name}>{name}</SelectItem>
                          )
                      })}
                  </SelectGroup>
              </SelectContent>
        </Select>   
          )} />
        
          <Controller name="company_id" control={control} render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
        
              <SelectTrigger>
                <SelectValue placeholder="Filter by Company">
                {field.value?companies?.find((com)=>com.id === Number(field.value))?.name:"Company"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
              {companies?.map(({ name, id }) => {
                return (
                  <SelectItem key={name} value={id}>
                    {name}
                  </SelectItem>
                );
              })}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
          /> 
          {/* add company drawer */}
        <AddCompanyDrawer fetchCompanies={fnCompanies} />
        </div>
        
        {errors.location && (
            <p className="text-red-500">{errors.location.message}</p>
          )}

          {errors.company_id && (
            <p className="text-red-500">{errors.company_id.message}</p>
          )}

        {/* MARK-Down editor  for writtting the requirements by recruiter*/}
        {/* Controller is generally used for third party component */}

        <Controller name="requirements" control={control} render={({ field }) => (
          <MDEditor value={field.value} onChange={field.onChange} />
        )} />
        {errors.requirements && (
          <p className="text-red-500">{errors.MDEditor.message}</p>
        )}
        
        {errorCreateJob?.message && (
          <p className="text-red-500">{errorCreateJob?.message}</p>
        )}
        

        {loadingCreateJob && <BarLoader width={"100%"} color="#36d7b7"/>}
        <Button type="submit" variant="blue" size="lg" className="mt-2">Submit</Button>

      </form>
    </div> 
  )
}

export default PostJob;