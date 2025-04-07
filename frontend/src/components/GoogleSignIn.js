import React, { useEffect } from 'react';
import { supabase } from '../supabase';
const GoogleSignIn = () => {
  useEffect(() => {
    // Initialize Google Sign-In
    window.google.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      callback: handleSignInWithGoogle,
      context: 'signin',
      ux_mode: 'popup',
      auto_select: true,
      itp_support: true,
      use_fedcm_for_prompt: true
    });

    // Render the button
    window.google.accounts.id.renderButton(
      document.getElementById('googleSignInDiv'),
      { theme: 'outline', size: 'large', width: '100%' }
    );
  }, []);

  const handleSignInWithGoogle = async (response) => {
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
      });

      if (error) throw error;
      console.log('Successfully signed in with Google:', data);
    } catch (error) {
      console.error('Error signing in with Google:', error.message);
    }
  };

  return (
    <div id="googleSignInDiv" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}></div>
  );
};

export default GoogleSignIn; 