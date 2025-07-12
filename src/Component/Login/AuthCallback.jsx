import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import Server_url from '../../config';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthCallback = () => {
      console.log('=== OAuth Callback Debug ===');
      console.log('Current URL:', window.location.href);
      console.log('Hash:', window.location.hash);
      console.log('Search:', window.location.search);
      
      let params = null;
      let accessToken = null;
      let error = null;
      let errorDescription = null;
      let state = null;
      
      // First, try hash parameters (standard OAuth2 implicit flow)
      if (window.location.hash) {
        console.log('Parsing hash parameters...');
        params = new URLSearchParams(window.location.hash.substring(1));
        accessToken = params.get('access_token');
        error = params.get('error');
        errorDescription = params.get('error_description');
        state = params.get('state');
        console.log('Hash params:', Object.fromEntries(params));
      }
      
      // If no hash, try search parameters
      if (!accessToken && !error && window.location.search) {
        console.log('Parsing search parameters...');
        params = new URLSearchParams(window.location.search.substring(1));
        accessToken = params.get('access_token');
        error = params.get('error');
        errorDescription = params.get('error_description');
        state = params.get('state');
        console.log('Search params:', Object.fromEntries(params));
      }
      
      // Handle errors
      if (error) {
        console.error('OAuth error:', error, errorDescription);
        let errorMessage = `Authentication failed: ${error}`;
        
        if (errorDescription) {
          errorMessage += `\n${errorDescription}`;
        }
        
        if (error === 'access_denied') {
          errorMessage += '\n\nYou denied access to the application.';
        } else if (error === 'redirect_uri_mismatch') {
          errorMessage += '\n\nRedirect URI mismatch. Please check your Google Cloud Console configuration.';
        }
        
        toast.error(errorMessage);
        navigate('/');
        return;
      }
      
      // Handle success
      if (accessToken) {
        console.log('✅ Access token found:', accessToken.substring(0, 20) + '...');
        console.log('State:', state);
        
        // Only handle admin login
        if (state === 'admin_login') {
          console.log('Admin login confirmed');
          if (accessToken.length > 10) {
            console.log('Token appears valid, calling onLoginSuccess...');
            localStorage.setItem('google_access_token', accessToken);
            // Set user as teacher via API
            fetch(`${Server_url}/api/users/update/`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken') || accessToken}`,
              },
              body: JSON.stringify({ is_teacher: true }),
            })
              .then(res => {
                if (!res.ok) throw new Error('Failed to update teacher role');
                // Reload/redirect to profile to show deactivate button
                window.location.href = '/Profile';
              })
              .catch(err => {
                console.error('Failed to update teacher role:', err);
                toast.error('Google connected, but failed to activate teacher panel.');
                window.location.href = '/Profile';
              });
            return;
          } else {
            console.error('Invalid token format');
            toast.error('Received invalid access token. Please try again.');
            navigate('/Profile');
          }
        } else {
          console.error('Invalid login state:', state);
          toast.error('Invalid login state. Please use the admin login.');
          navigate('/Profile');
        }
      } else {
        console.warn('No access token found in URL');
        toast.error('No access token received from Google OAuth. Please try again.');
        navigate('/Profile');
      }
    };

    const timeoutId = setTimeout(handleOAuthCallback, 100);
    return () => clearTimeout(timeoutId);
  }, [navigate]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "40px",
        borderRadius: "16px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        textAlign: "center",
        maxWidth: "400px",
        width: "90%"
      }}>
        <div style={{
          fontSize: "48px",
          marginBottom: "20px"
        }}>
          🔄
        </div>
        <h2 style={{
          fontSize: "24px",
          fontWeight: "600",
          color: "#333",
          marginBottom: "12px"
        }}>
          Processing Login...
        </h2>
        <p style={{
          fontSize: "16px",
          color: "#666",
          lineHeight: "1.5"
        }}>
          Please wait while we complete your authentication.
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
