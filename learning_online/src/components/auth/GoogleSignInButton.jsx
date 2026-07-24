import { useEffect, useRef, useState } from 'react';
import { Alert, Box } from '@mui/material';
import { GOOGLE_CLIENT_ID } from '../../config/env';

/**
 * Renders the official Google "Sign in with Google" button using Google
 * Identity Services (loaded globally via the <script> tag in index.html).
 *
 * onSuccess receives the raw Google ID token (JWT string) which should be
 * sent to the backend's /auth/google endpoint for verification.
 */
function GoogleSignInButton({ onSuccess, onError, text = 'signin_with' }) {
  const buttonRef = useRef(null);
  const [scriptError, setScriptError] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      return;
    }

    let cancelled = false;

    const renderButton = () => {
      if (cancelled || !window.google?.accounts?.id || !buttonRef.current) {
        return;
      }

      // Clear any previously rendered button (e.g. React StrictMode double-invoke in dev)
      buttonRef.current.innerHTML = '';

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (response?.credential) {
            onSuccess(response.credential);
          } else if (onError) {
            onError(new Error('No credential returned from Google'));
          }
        }
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text,
        width: 320
      });
    };

    if (window.google?.accounts?.id) {
      renderButton();
    } else {
      // The GIS script loads asynchronously; poll briefly until it's ready.
      let attempts = 0;
      const interval = setInterval(() => {
        attempts += 1;
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          renderButton();
        } else if (attempts > 40) {
          clearInterval(interval);
          if (!cancelled) setScriptError(true);
        }
      }, 250);

      return () => {
        cancelled = true;
        clearInterval(interval);
      };
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  if (!GOOGLE_CLIENT_ID) {
    return null;
  }

  if (scriptError) {
    return (
      <Alert severity="warning" sx={{ mt: 1 }}>
        Google Sign-In failed to load. Check your internet connection and try again.
      </Alert>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
      <div ref={buttonRef} />
    </Box>
  );
}

export default GoogleSignInButton;
