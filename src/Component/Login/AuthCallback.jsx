import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import Server_url from '../../config';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthCallback = () => {
      let params = null;
      let accessToken = null;
      let error = null;
      let errorDescription = null;
      let state = null;
      let refreshToken = null;

      if (window.location.hash) {
        params = new URLSearchParams(window.location.hash.substring(1));
        accessToken = params.get('access_token');
        refreshToken = params.get('refresh_token');
        error = params.get('error');
        errorDescription = params.get('error_description');
        state = params.get('state');
      }
      if (!accessToken && !error && window.location.search) {
        params = new URLSearchParams(window.location.search.substring(1));
        accessToken = params.get('access_token');
        refreshToken = params.get('refresh_token');
        error = params.get('error');
        errorDescription = params.get('error_description');
        state = params.get('state');
      }
      if (error) {
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

      // --- EXISTING TEACHER/ADMIN LOGIC ---
      if (accessToken) {
        if (state === 'admin_login') {
          if (accessToken.length > 10) {
            localStorage.setItem('google_access_token', accessToken);
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
                window.location.href = '/Profile';
              })
              .catch(err => {
                toast.error('Google connected, but failed to activate teacher panel.');
                window.location.href = '/Profile';
              });
            return;
          } else {
            toast.error('Received invalid access token. Please try again.');
            navigate('/Profile');
          }
        }
        // --- END EXISTING TEACHER/ADMIN LOGIC ---

        // --- NEW: LOGIN LOGIC (from AuthCallbackLogin) ---
        // If state is not admin_login, treat as normal login
        else {
          // Store Google tokens in localStorage
          localStorage.setItem("authToken", accessToken);
          if (refreshToken) {
            localStorage.setItem("refreshToken", refreshToken);
          }

          // Send tokens to backend for app JWT
          fetch(`${Server_url}/api/auth/google/jwt/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              provider: 'google',
              access_token: accessToken,
              // refresh_token: refreshToken,
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              console.log(data);
              if (data.access) {
                localStorage.setItem("authToken", data.access);
                // localStorage.setItem("refreshToken", data.refresh);
                navigate("/Dashboard");
              } else {
                toast.error(data.detail || "Google login failed.");
                navigate("/login");
              }
            })
            .catch((err) => {
              toast.error("Google login failed.");
              navigate("/login");
            });
        }
        // --- END LOGIN LOGIC ---
      } else {
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
