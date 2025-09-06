/*
Defines responses given by the mock server while running tests.
*/

import { http, HttpResponse } from 'msw';

const headerCsrfResponse = {
  get: http.get('/contact', () => {
    return HttpResponse.json({}, {
      headers: {
        'Access-Control-Expose-Headers': 'X-CSRF-Token',
        'Set-Cookie': 'csrftoken=secret',
        'X-CSRF-Token': 'randomToken',
      },
      status: 200,
    });
  }),

  post: http.post('/contact', async ({ cookies, request }) => {
    const data = await request.json();
    if (!(data.firstName && data.lastName && data.email && data.phone
          && data.message)) {
      return HttpResponse.json({ message: 'Invalid data' }, { status: 400 });
    }

    const csrfTokenHeader = request.headers.get('X-CSRF-Token');
    if (csrfTokenHeader !== 'randomToken') {
      return HttpResponse.json({ message: 'Invalid header' }, { status: 400 });
    }

    if (cookies.csrftoken !== 'secret') {
      return HttpResponse.json({ message: 'Invalid header' }, { status: 400 });
    }

    return HttpResponse.json({ message: 'Success' }, { status: 200 });
  }),
}

const bodyCsrfResponse = {
  get: http.get('/contact', () => {
    return HttpResponse.json({ token: 'randomToken' }, {
      headers: {
        'Set-Cookie': 'csrftoken=secret',
      },
      status: 200,
    });
  }),

  post: http.post('/contact', async ({ cookies, request }) => {
    const data = await request.json();
    if (!(data.firstName && data.lastName && data.email && data.phone
          && data.message && data.csrfToken)) {
      return HttpResponse.json({ message: 'Invalid data' }, { status: 400 });
    }

    if (data.csrfToken !== 'randomToken') {
      return HttpResponse.json({ message: 'Invalid header' }, { status: 400 });
    }

    if (cookies.csrftoken !== 'secret') {
      return HttpResponse.json({ message: 'Invalid header' }, { status: 400 });
    }

    return HttpResponse.json({ message: 'Success' }, { status: 200 });
  }),
}

export { headerCsrfResponse, bodyCsrfResponse };
