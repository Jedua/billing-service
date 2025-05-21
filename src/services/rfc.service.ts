import Facturapi from 'facturapi';
const facturapi = new Facturapi(process.env.FACTURAPI_KEY_TEST as string);

export const validateRfc = async (rfc: string) => {
  try {
    return await facturapi.tools.validateTaxId(rfc);
  } catch (error) {
    throw new Error(`Error validating RFC: ${(error as Error).message}`);
  }
};
