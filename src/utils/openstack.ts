import axios from 'axios';

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
}

export async function getOpenstackToken() {
  const keystoneUrl = getEnv('OPENSTACK_AUTH_URL');
  const username = getEnv('OPENSTACK_USERNAME');
  const password = getEnv('OPENSTACK_PASSWORD');
  const domain = getEnv('OPENSTACK_USER_DOMAIN_NAME');
  const projectId = getEnv('OPENSTACK_PROJECT_ID');

  const body = {
    auth: {
      identity: {
        methods: ['password'],
        password: {
          user: {
            name: username,
            domain: { name: domain },
            password: password,
          },
        },
      },
      scope: {
        project: { id: projectId },
      },
    },
  };

  const response = await axios.post(keystoneUrl, body, {
    headers: { 'Content-Type': 'application/json' }
  });
  const token = response.headers['x-subject-token'];
  if (!token) throw new Error('No se recibió el token');
  return token;
}

