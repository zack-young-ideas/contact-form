import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react';
import type { RequestHeader, UserData } from './types.ts';
import './App.css'

function App({
  csrfUrl,
  submitUrl,
  csrfHeaderName=null,
  csrfFieldName=null,
}: {
  csrfUrl: string,
  submitUrl: string,
  csrfHeaderName?: string | null,
  csrfFieldName?: string | null,
}) {

  // Validate props values first.
  if (!csrfHeaderName && !csrfFieldName) {
    throw new Error(
      'Must provide a value for either csrfHeaderName or csrfFieldName; '
      + 'cannot both be null'
    );
  }

  if (!csrfUrl) {
    throw new Error('Must provide a value for csrfUrl');
  }

  if (!submitUrl) {
    throw new Error('Must provide a value for submitUrl');
  }

  const [csrfToken, setCsrfToken] = useState('');
  const [spinner, setSpinner] = useState(true);
  const [formData, setFormData] = useState<UserData>({
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
      let timeoutId
      try {
        const controller = new AbortController();
        const timeoutDuration = 8000;
        timeoutId = setTimeout(
          () =>  controller.abort(),
          timeoutDuration
        );
        const response = await fetch(
          csrfUrl,
          { credentials: 'same-origin', signal: controller.signal }
        );
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
      } finally {
        clearTimeout(timeoutId);
      }
    }
    retrieveCsrfToken();
  }, [csrfUrl, csrfHeaderName, csrfFieldName, csrfToken.length]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    /*
    Called any time the user types anything into the contact form.
    */
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  }

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    /*
    Submits the contact form to the server.
    */
    event.preventDefault();
    let timeoutId
    try {
      const controller = new AbortController();
      const timeoutDuration = 8000;
      timeoutId = setTimeout(
        () =>  controller.abort(),
        timeoutDuration
      );
      const headers: RequestHeader = {
        'Content-Type': 'application/json',
      }
      if (csrfFieldName) {
        formData[csrfFieldName] = csrfToken;
      } else {
        if (csrfHeaderName) {
          headers[csrfHeaderName] = csrfToken;
        }
      }
      const response = await fetch(submitUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(formData),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message);
      } else {
        setSuccess(true);
      }
    } catch {
      setError('Unable to connect to server');
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Defines error message.
  const errorContent = (
    <p
      data-testid="error-message"
      id="contact-form-error-message"
    >
      {error}
    </p>
  );

  // Define hidden form field; only used if csrfFieldName is specified.
  let hiddenFormField = null;
  if (csrfFieldName && !csrfHeaderName) {
    hiddenFormField = (
      <input
        data-testid="csrf-token"
        name={csrfFieldName}
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
