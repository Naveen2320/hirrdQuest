import React from 'react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Input } from './ui/input';
import { z } from "zod";
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import useFetch from '@/hooks/use-fetch';
import { applyToJob } from '@/api/apiApplication';
import { BarLoader } from 'react-spinners';

// Zod is library to check the information provided in FORM is correct or not.

    const schema = z.object({
    experience: z.number().min(0, { message: "experience must be at least 0" }).int(),
    skills: z.string().min(1, { message: "Skills are required" }),
    cgpa: z.number().min(0, { message: "CGPA must be a positive number" }).max(10, { message: "CGPA must be between 0 and 10" }).optional(),
    education: z.enum(["Intermediate", "Graduate", "PostGraduate"], {
        message:"Education is required",
    }),

    resume: z.any().refine((file) => file && (file[0].type === "application/pdf" || file[0].type === "application/msword"), {
    message: "Only pdf or Word documents are allowed"
   }),
});



   const ApplyJobDrawer = ({ user, job, applied = false, fetchJob }) => {

    const { register, handleSubmit, control, formState: { errors }, reset } = useForm({
        resolver: zodResolver(schema),
    });

    const { loading: loadingApply, error: errorApply, fn: fnApply, } = useFetch(applyToJob);
    
       const onSubmit = (data) => {
        // Check if the candidate's CGPA meets the job's CGPA criteria
        if (data.cgpa && job.cgpa_criteria && data.cgpa < job.cgpa_criteria) {
        alert(`Your CGPA must be at least ${job.cgpa_criteria} or above to apply for this job.`);
        return;
    }
        fnApply({
            ...data,
            job_id: job.id,
            candidate_id: user.id,
            name: user.fullName,
            status: "applied",
            resume: data.resume[0],
        }).then(() => {
            fetchJob();
            reset();
        });
        
    };


    return (
    <Drawer open={applied?false: undefined}>
        <DrawerTrigger asChild>
                <Button  size= "lg" variant={job?.isOpen && !applied ? "blue" : "destructive"}
                disabled={!job?.isOpen || applied}
                >
                    {job?.isOpen?(applied? "Applied": "Apply") : "Hiring Closed"}
                </Button>
        </DrawerTrigger>
        <DrawerContent>
            <DrawerHeader>
                <DrawerTitle>Apply for {job?.title} at {job?.company?.name}</DrawerTitle>
                <DrawerDescription>Please Fill the form below.</DrawerDescription>
            </DrawerHeader>
                
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4 p-4 pb-0'>
                <Input type="number" placeholder="Years of Experience" className="flex-1" {...register("experience", { valueAsNumber: true, })} />
                
                    {/* after each input if there will be an error it would be also displayed*/}
                    {errors.experience && (
                        <p className='text-red-500'>{errors.experience.message}</p>
                    )}

                    <Input type="text" placeholder="Skills  (Comma Separated)" className="flex-1" {...register("skills")} />
                    
                    {errors.skills && (
                        <p className="text-red-500">{errors.skills.message}</p>
                    )}
                    {/* cgpa shortlisting features */}
                    <Input placeholder="Enter CGPA (0-10)" type="number" step="0.1" {...register("cgpa",{ valueAsNumber: true })}/>
                    {errors.cgpa && <p className="text-red-500">{errors.cgpa.message}</p>}

                     {/* Display CGPA criteria */}
                     {job?.cgpa_criteria && (
                      <p className="text-gray-500"> CGPA criteria for this job: {job.cgpa_criteria} or above</p>
                    )}
                    
                    <Controller name="education" control={control} render={({ field }) => (
                        
                    <RadioGroup {...field} onValueChange={field.onChange}>
                       <div className="flex items-center space-x-2">
                       <RadioGroupItem value="Intermediate" id="intermediate" />
                       <Label htmlFor="intermediate">Intermediate</Label>
                       </div>
                       <div className="flex items-center space-x-2">
                       <RadioGroupItem value="Graduate" id="graduate" />
                       <Label htmlFor="graduate">Graduate</Label>
                       </div>
                       <div className="flex items-center space-x-2">
                       <RadioGroupItem value="Post Graduate" id="post-graduate" />
                       <Label htmlFor="post-graduate">Post Graduate</Label>
                       </div>
                    </RadioGroup>  
                    )} />
                    
                    {errors.education && (
                        <p className='text-red-500'>{errors.education.message}</p>
                    )}
                  
                    
                <Input type="file" accept=".pdf, .doc, .docx," className="flex-1 file:text-gray-500" {...register("resume")} />

                    {errors.resume && (
                        <p className='text-red-500'>{errors.resume.message}</p>
                    )}

                      {errorApply?.message && (
                        <p className='text-red-500'>{errorApply?.message}</p>
                    )}

                    {loadingApply && <BarLoader width={"100%"} color='#36d7b7'/>}

                <Button type="submit" variant="blue" size="lg">Apply</Button>
            </form>
                

        <DrawerFooter>
        <DrawerClose asChild>
           <Button variant="outline">Cancel</Button>
        </DrawerClose>
        </DrawerFooter>
        </DrawerContent>
    </Drawer>

  );
}

export default ApplyJobDrawer