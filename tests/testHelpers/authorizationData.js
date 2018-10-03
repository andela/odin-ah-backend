const noAuthRequiredMock = [
  {
    path: '/api-docs/**',
  },
  {
    path: '/public/**',
  },
  {
    path: '/api/v1/auth/**',
  },
  {
    path: '/api/v1/users**',
  },
  {
    path: '/api/v1/profiles/*',
    method: 'GET'
  },
  {
    path: '/api/v1/articles**',
    method: 'GET'
  },

];
export default noAuthRequiredMock;
