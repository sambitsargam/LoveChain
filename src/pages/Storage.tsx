import { SSX } from "@spruceid/ssx";
import { useState, useEffect } from "react";
import KeplerStorageComponent from "../components/KeplerStorageComponent";
import React from "react";

const SSXComponent = () => {
  const [ssxProvider, setSSX] = useState<SSX | null>(null);

  const ssxHandler = async () => {
    const ssx = new SSX({
      modules: {
        storage: {
          prefix: 'my-app',
          hosts: ['https://kepler.spruceid.xyz'],
          autoCreateNewOrbit: true
        }
      }
    });
    await ssx.signIn();
    setSSX(ssx);
  };

  const ssxLogoutHandler = async () => {
    ssxProvider?.signOut();
    setSSX(null);
  };

  const address = ssxProvider?.address() || '';

  useEffect(() => {
    // Automatically sign in when the component mounts
    ssxHandler();
  }, []); // Empty dependency array to run only once on mount

  return (
    <>
      <br />
      {ssxProvider ? (
        <>
          {address && (
            <p>
              <b>Ethereum Address:</b> <code>{address}</code>
            </p>
          )}
          <br />
          <button onClick={ssxLogoutHandler}>
            <span>Sign-Out</span>
          </button>
          <br />
          <KeplerStorageComponent ssx={ssxProvider} />
        </>
      ) : (
        <button onClick={ssxHandler}>
          <span>Sign-In</span>
        </button>
      )}
    </>
  );
};

export default SSXComponent;
