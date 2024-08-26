import { useUser } from '@clerk/clerk-react';
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({children}) => {
    const { isSignedIn, user, isLoaded } = useUser();
    const { pathname } = useLocation();

    if (isLoaded && !isSignedIn && isSignedIn !== undefined) {
       return  <Navigate to="/?sign-in=true" />;
    }

    // check on-boarding status (where the user goes in recruiter or seekers).
    if(user!== undefined && !user?.unsafeMetadata?.role && pathname!=="/onboarding")return <Navigate to="/onboarding"/>



    return children;
}

export default ProtectedRoute;