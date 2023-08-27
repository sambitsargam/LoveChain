import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@windmill/react-ui";
import { local } from "web3modal";

function Chat() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentUserAddress = localStorage.getItem("address");

  useEffect(() => {
    setLoading(true);
    fetch("https://lovechain-23ba6-default-rtdb.firebaseio.com/chat.json")
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);
        const usersArray = Object.values(data).map((entry) => ({
          id: entry.sender,
          receiver: entry.receiver,
          sender: entry.sender,
        }));
        setUsers(usersArray);
      })
      .catch((error) => {
        setLoading(false);
        setError(error);
      });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-8xl mx-auto overflow-hidden bg-white rounded-lg shadow-xl dark:bg-gray-800">
        <div className="flex flex-col">
          <main className="p-6 sm:p-12 md:w-1/2 mx-auto">
            <h1 className="text-4xl font-semibold text-center mb-6">
              Chat Users
            </h1>
            {loading ? (
              <p className="text-center">
                No User Found... First go to Dashboard, click on Chat for a
                particular user.
              </p>
            ) : error ? (
              <p className="text-center">Error: {error.message}</p>
            ) : (
              users.map((user) => (
                <div key={user.id} className="bg-blue-100 p-4 my-4 rounded-lg">
                  <p className="text-center">Wanna Chat 😍 {user.receiver}</p>
                  {user.sender === currentUserAddress ? (
                    <Button tag={Link} to={user.link} block className="mt-4">
                      Let's Start 🥰
                    </Button>
                  ) : null}
                </div>
              ))
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default Chat;
