import { useEffect, useState } from 'react'
import './App.css'

function App({ url }: { url: String }) {

  const [csrfToken, setCsrfToken] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    /*
    Retrieves a CSRF token upon loading the contact form.
    */
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Unable to retrieve CSRF token');
        }
        return response.json();
      })
      .then(data => {
        setCsrfToken(data.token);
      })
      .catch(error => {
        setError(true);
      });
  }, []);

  const errorMessage = (
    <p data-testid="error-message">Unable to load contact form</p>
  );

  return (
    <>
      <form>
        <input
          data-testid="csrf-token"
          name="csrf_token"
          type="hidden"
          value={csrfToken}
        />
        {error && errorMessage}
        <button>Submit</button>
      </form>
    </>
  )
}

export default App
