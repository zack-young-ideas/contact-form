import { useEffect, useState } from 'react'
import './App.css'

function App({ url }: { url: String }) {

  const [csrfToken, setCsrfToken] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
  });
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

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
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Unable to submit form');
      }
      setSuccess(true);
    } catch (error) {
      setError(true);
    }
  }

  const errorMessage = (
    <p
      data-testid="error-message"
      id="contact-form-error-message"
    >
      Unable to load contact form
    </p>
  );
  const successMessage = (
    <p
      data-testid="success-message"
      id="contact-form-success-message"
    >
      Form submitted successfully
    </p>
  );

  return (
    <>
      <form onSubmit={submitForm}>
        <input
          data-testid="first-name"
          name="first_name"
          onChange={handleChange}
          placeholder="First Name"
          type="text"
          value={formData.firstName}
        />
        <input
          data-testid="last-name"
          name="last_name"
          onChange={handleChange}
          placeholder="Last Name"
          type="text"
          value={formData.lastName}
        />
        <input
          data-testid="email-address"
          name="email_address"
          onChange={handleChange}
          placeholder="Email Address"
          type="email"
          value={formData.email}
        />
        <input
          data-testid="phone-number"
          name="phone_number"
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
        <input
          data-testid="csrf-token"
          name="csrf_token"
          type="hidden"
          value={csrfToken}
        />
        {error && errorMessage}
        {success && successMessage}
        <button type="submit">Submit</button>
      </form>
    </>
  )
}

export default App
