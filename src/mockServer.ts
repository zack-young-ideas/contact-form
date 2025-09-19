/*
Defines responses given by the mock server while running tests.
*/

import { http, HttpResponse } from 'msw';
import type { UserData } from './types.ts';

// Defines the request handlers used when the CSRF token is sent in a
// custom header.
const headerCsrfResponse = {
  get: (headerName: string) => {
    const headers: {[index: string]:string} = {
      'Access-Control-Expose-Headers': headerName,
      'Set-Cookie': 'csrftoken=secret',
    };
    headers[headerName] = 'randomToken';
    const mock = http.get('/csrf', () => {
      return HttpResponse.json({}, {
        headers: headers,
        status: 200,
      });
    });
    return mock;
  },

  post: (headerName: string) => {
    const mock = http.post('/contact', async ({ cookies, request }) => {
      const data = await request.json() as UserData;
      if (!(data.firstName && data.lastName && data.email && data.phone
            && data.message)) {
        return HttpResponse.json({
          message: 'Invalid data'
        }, {
          status: 400
        });
      }

      const csrfTokenHeader = request.headers.get(headerName);
      if (csrfTokenHeader !== 'randomToken') {
        return HttpResponse.json({
          message: 'Invalid header'
        }, {
          status: 400
        });
      }

      if (cookies.csrftoken !== 'secret') {
        return HttpResponse.json({
          message: 'Invalid cookie value'
        }, {
          status: 400
        });
      }

      return HttpResponse.json({ message: 'Success' }, { status: 200 });
    });
    return mock;
  },
}

// Defines the request handlers used when the CSRF token is sent in the
// body of the POST request.
const bodyCsrfResponse = {
  get: (fieldName: string) => {
    const response: {[index: string]:string} = {};
    response[fieldName] = 'randomToken';
    const mock = http.get('/csrf', () => {
      return HttpResponse.json(response, {
        headers: {
          'Set-Cookie': 'csrftoken=secret',
        },
        status: 200,
      });
    });
    return mock;
  },

  post: () => {
    const mock = http.post('/contact', async ({ cookies, request }) => {
      const data = await request.json() as UserData;
      if (!(data.firstName && data.lastName && data.email && data.phone
            && data.message && data.token)) {
        return HttpResponse.json({
          message: 'Invalid data'
        }, {
          status: 400
        });
      }

      if (data.token !== 'randomToken') {
        return HttpResponse.json({
          message: 'Invalid header'
        }, {
          status: 400
        });
      }

      if (cookies.csrftoken !== 'secret') {
        return HttpResponse.json({
          message: 'Invalid cookie value'
        }, {
          status: 400
        });
      }

      return HttpResponse.json({ message: 'Success' }, { status: 200 });
    });
    return mock;
  },
}

export { headerCsrfResponse, bodyCsrfResponse };
