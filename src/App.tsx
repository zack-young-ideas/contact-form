import { useEffect, useState } from 'react'
import './App.css'

function App({
  url,
  csrfHeaderName=null,
  csrfFieldName=null,
}: {
  url: String,
  csrfHeaderName: String | null,
  csrfFieldName: String | null,
}) {

  if (!csrfHeaderName && !csrfFieldName) {
    throw new Error(
      'Must provide at value for either csrfHeaderName or csrfFieldName; '
      + 'cannot both be null'
    );
  }

  const [csrfToken, setCsrfToken] = useState('');
  const [spinner, setSpinner] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    /*
    Retrieves a CSRF token upon loading the contact form.
    */
    const retrieveCsrfToken = async () => {
      try {
        const response = await fetch(url, { credentials: 'same-origin' });
        if (!response.ok) {
          setError('Unable to load contact form');
          setSpinner(false);
          return;
        }
        if (csrfHeaderName) {
          const headers = response.headers;
          const csrfTokenValue = headers.get('X-CSRF-Token');
          if (!csrfTokenValue) {
            setError('Unable to load contact form');
            setSpinner(false);
          } else {
            setCsrfToken(csrfTokenValue);
            setSpinner(false);
          }
          return;
        }
        if (csrfFieldName) {
          const data = await response.json();
          const csrfTokenValue = data[csrfFieldName];
          if (!csrfTokenValue && (csrfToken.length === 0)) {
            setError('Unable to load contact form');
            setSpinner(false);
          } else {
            setCsrfToken(csrfTokenValue);
            setSpinner(false);
          }
          return;
        }
        setError('Unable to load contact form');
        setSpinner(false);
      } catch {
        setError('Unable to load contact form');
        setSpinner(false);
      }
    }
    retrieveCsrfToken();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  }

  const submitForm = async (event) => {
    event.preventDefault();
    try {
      let headers = {
        'Content-Type': 'application/json',
      }
      if (csrfHeaderName) {
        headers[csrfHeaderName] = csrfToken;
      }
      formData.csrfToken = csrfToken;
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      setSuccess(true);
    } catch (error) {
      setError(error.message);
    }
  }

  const errorContent = (
    <p
      data-testid="error-message"
      id="contact-form-error-message"
    >
      {error}
    </p>
  );

  let hiddenFormField = null;
  if (csrfFieldName && !csrfHeaderName) {
    hiddenFormField = (
      <input
        data-testid="csrf-token"
        name="csrfToken"
        type="hidden"
        value={csrfToken}
      />
    );
  }

  let content;
  if (success) {
    content = (
      <div>
        <p
          data-testid="success-message"
          id="contact-form-success-message"
        >
          Form submitted successfully
        </p>
      </div>
    );
  } else if (spinner) {
    content = <div id="contact-form-spinner"></div>
  } else {
    content = (
      <>
        <form onSubmit={submitForm}>
          <input
            data-testid="first-name"
            name="firstName"
            onChange={handleChange}
            placeholder="First Name"
            type="text"
            value={formData.firstName}
          />
          <input
            data-testid="last-name"
            name="lastName"
            onChange={handleChange}
            placeholder="Last Name"
            type="text"
            value={formData.lastName}
          />
          <input
            data-testid="email-address"
            name="email"
            onChange={handleChange}
            placeholder="Email Address"
            type="email"
            value={formData.email}
          />
          <input
            data-testid="phone-number"
            name="phone"
            onChange={handleChange}
            placeholder="Phone Number"
            type="text"
            value={formData.phone}
          />
          <textarea
            data-testid="message"
            name="message"
            onChange={handleChange}
            placeholder="Message"
            value={formData.message}
          ></textarea>
          {hiddenFormField}
          {error && errorContent}
          <button type="submit">Submit</button>
        </form>
      </>
    )
  }

  return content;
}

export default App
