export interface BasicPostCredential {
    type: "BasicPostAttestation", // The URN of the UUID of the credential.
    id: string, // The DID of the user who is the credential subject, comes from the VC.credentialSubject.id
    subject: string,
    title: string,
    body: string,
  }
  
  export const encode = (c: string): string => {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  };
  
  export const parseJWT = (jwt_str: string): any => {
    const v = jwt_str.split('.');
    if (v.length !== 3) throw new Error('Invalid JWT format');
    const u = v[1];
    const b64 = u.replace(/-/g, '+').replace(/_/g, '/');
    const encoded = atob(b64).split('').map(encode).join('');
    const json_str = decodeURIComponent(encoded);
    return JSON.parse(json_str);
  };
  
  export const toCredentialContent = (jwt_str: string): Record<string, any> | void => {
    const parsed = parseJWT(jwt_str);
    const vc = parsed?.vc;
    if (!vc) throw new Error('Malformed jwt, no vc property');
    const t = vc?.type;
    if (!t) throw new Error('Malformed credential, no type property');
    if (t.length !== 2) throw new Error('Malformed credential, type property did not have length of 2');
    const credType = t[1];
    const credID = vc?.id;
    if (!credID) throw new Error('No id property found under vc property in JWT credential');
    const subjID = vc?.credentialSubject?.id;
    if (!subjID) throw new Error('No id property found under vc.credentialSubject property in JWT credential');
    const issuanceDate = vc?.issuanceDate;
    if (!issuanceDate) throw new Error('No issuanceDate property found under vc property in JWT credential');
    const c = {
      type: credType,
      id: credID,
      subject: subjID,
      issuanceDate
    };
    switch (credType) {
      case "BasicPostAttestation": {
        let next = {
          title: getCredSubjProp("title", vc),
          body: getCredSubjProp("body", vc)
        };
        try {
          let reply_to = getCredSubjProp("reply_to", vc);
          next = Object.assign({}, next, { reply_to });
        } catch (_e) { }
        return Object.assign({}, c, next) as BasicPostCredential;
      }
      default:
        return vc;
    }
  };
  
  export const toCredentialEntry = (jwt_str: string): Record<string, any> => {
    const content = toCredentialContent(jwt_str);
    return { jwt: jwt_str, content: content };
  };
  
  const getCredSubjProp = (prop: string, vc: any): any => {
    let x = vc?.credentialSubject[prop];
    if (!x) throw new Error(`No ${prop} property found under vc.credentialSubject property in JWT credential`)
    return x;
  }