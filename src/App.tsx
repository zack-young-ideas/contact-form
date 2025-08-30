import { useEffect, useState } from 'react'
import './App.css'

function App({ url }: { url: String }) {

  const [csrfToken, setCsrfToken] = useState('');

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
        console.error(error);
      });
  }, []);

  return (
    <>
      <form>
        <input
          data-testid="csrf_token"
          name="csrf_token"
          type="hidden"
          value={csrfToken}
        />
      </form>
    </>
  )
}

export default App
