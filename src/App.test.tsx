import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import App from './App';

const server = setupServer(
  http.get('/contact', () => {
    return HttpResponse.json({ token: 'randomToken' });
  }),

  http.post('/contact', () => {
    return HttpResponse.json({ message: 'Success' });
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('App', () => {
  it('retrieves CSRF token upon loading', async () => {
    render(<App url="/contact" />);

    await waitFor(() => {
      expect(screen.getByTestId('csrf-token')).toHaveValue('randomToken');
    });
  });

  it('displays error message if CSRF token is unavailable', async () => {
    server.use(
      http.get('/contact', () => {
        return new HttpResponse.json(null, { status: 500 });
      }),
    );

    render(<App url="/contact" />);

    await waitFor(() => {
      expect(screen.getByTestId('error-message'))
        .toHaveTextContent('Unable to load contact form');
    });
  });

  it('submits form data', async () => {
    render(<App url="/contact" />);

    const firstNameField = await screen.getByTestId('first-name');
    const lastNameField = await screen.getByTestId('last-name');
    const emailField = await screen.getByTestId('email-address');
    const phoneField = await screen.getByTestId('phone-number');
    const messageField = await screen.getByTestId('message');
    const submitButton = await screen.getByRole('button', { name: 'Submit' });

    fireEvent.change(firstNameField, { target: { value: 'John' } });
    fireEvent.change(lastNameField, { target: { value: 'Smith' } });
    fireEvent.change(emailField, { target: { value: 'jsmith@example.com' } });
    fireEvent.change(phoneField, { target: { value: '1234567890' } });
    fireEvent.change(
      messageField, { target: { value: 'I would love to hear from you.' } }
    );
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('success-message'))
        .toHaveTextContent('Form submitted successfully');
    });
  });

  it('displays error message if POST request fails', async () => {
    server.use(
      http.post('/contact', () => {
        return new HttpResponse.json(null, { status: 500 });
      }),
    );

    render(<App url="/contact" />);

    const firstNameField = await screen.getByTestId('first-name');
    const lastNameField = await screen.getByTestId('last-name');
    const emailField = await screen.getByTestId('email-address');
    const phoneField = await screen.getByTestId('phone-number');
    const messageField = await screen.getByTestId('message');
    const submitButton = await screen.getByRole('button', { name: 'Submit' });

    fireEvent.change(firstNameField, { target: { value: 'John' } });
    fireEvent.change(lastNameField, { target: { value: 'Smith' } });
    fireEvent.change(emailField, { target: { value: 'jsmith@example.com' } });
    fireEvent.change(phoneField, { target: { value: '1234567890' } });
    fireEvent.change(
      messageField, { target: { value: 'I would love to hear from you.' } }
    );
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('error-message'))
        .toHaveTextContent('Unable to load contact form');
    });
  });
});
