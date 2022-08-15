import "./App.css";
import { useState } from "react";
import axios from "axios";

import { initializeApp } from "firebase/app";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { faCloud } from "@fortawesome/free-solid-svg-icons";
import { faBookOpen } from "@fortawesome/free-solid-svg-icons";
import { faBook } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_APIKEY,
  authDomain: process.env.REACT_APP_AUTHDOMAIN,
  projectId: process.env.REACT_APP_PROJECTID,
  storageBucket: process.env.REACT_APP_STORAGEBUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGINGSENDERID,
  appId: process.env.REACT_APP_APPID,
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

function App() {
  const [signedIn, setSignedIn] = useState(false);
  const [isbn, setIsbn] = useState("");
  const [bookAll, setBookAll] = useState([]);
  const [person, setPerson] = useState({ email: "", password: "" });
  const [book, setBook] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [emptyIsbnError, setemptyIsbnError] = useState(false);
  const [isbnError, setisbnError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [signUp, setSignUp] = useState(false);
  const [stats, setStats] = useState("");
  const [img, setImg] = useState("");
  const [error, setError] = useState("");

  // Handle view book details model
  const toggleModal = (bookid) => {
    auth.currentUser.getIdToken().then(function (idToken) {
      axios
        .get("https://book-stats-456.herokuapp.com/title", {
          params: { book_id: bookid },
          headers: { Authorization: `Bearer ${idToken}` },
        })
        .then((res) => {
          setBook(res.data[0]);
        })
        .catch((error) => {
          console.error(error);
        });
    });

    setShowModal(true);
  };

  const backHome = () => {
    setStats(false);
  };

  //Email Password Login Form Fields
  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setPerson({ ...person, [name]: value });
  };

  //Email Password Login Form Submit Handler
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (person.email && person.password) {
      //const newPerson = { ...person, id: new Date().getTime().toString() };

      signInWithEmailAndPassword(auth, person.email, person.password)
        .then((userCredential) => {
          setSignedIn(true);
          setError("");
          userCredential.user.getIdToken().then((idToken) => {
            axios
              .get("https://book-stats-456.herokuapp.com/list", {
                headers: { Authorization: `Bearer ${idToken}` },
              })
              .then((res) => {
                setBookAll(res.data);
                setIsLoading(false);
                setError("");
              })
              .catch((error) => {
                console.error(error);
                setError(error);
              });
          });
        })
        .catch((error) => {
          
          const errorMessage = error.message;
          setError(errorMessage);
        });

      setPerson({ email: "", password: "" });
    } else {
      setError("Please enter email and password");
    }
  };

  //Google Login Form Submit Handler
  const handleGoogleLogin = () => {
    signInWithPopup(auth, provider)
      .then((userCredential) => {
        setSignedIn(true);
        userCredential.user.getIdToken().then((idToken) => {
          axios
            .get("https://book-stats-456.herokuapp.com/list", {
              headers: { Authorization: `Bearer ${idToken}` },
            })
            .then((res) => {
              setBookAll(res.data);
              setIsLoading(false);
              setError("");
            })
            .catch((error) => {
              console.error(error);
            });
        });
      })
      .catch((error) => {
         
        const errorCode = error.code;
       
        console.log(errorCode);
        
      });
  };

  //Sign up form handler
  const addUser = (e) => {
    e.preventDefault();
    if (person.email && person.password) {
      
      createUserWithEmailAndPassword(auth, person.email, person.password)
        .then((userCredential) => {
          setSignedIn(true);
          setIsLoading(false);
          setError("");
        })
        .catch((error) => {
         
          const errorMessage = error.message;

          setError(errorMessage);
        });
      
    } else {
      setError("Please enter email and password");
    }
  };

  // logout button handler
  function logOutUser() {
    signOut(auth)
      .then(() => {
        setSignedIn(false);
        setSignUp(false);
        setBookAll([]);
        setStats(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }
  // add isbn form handler
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true)
    if (isbn) {
      auth.currentUser
        .getIdToken()
        .then(function (idToken) {
          const body = {
            id: Date.now().toString(),
            isbn: isbn,
          };
          axios
            .post("https://book-stats-456.herokuapp.com/add", body, {
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            })
            .then((res) => {
              if (
                res.data ===
                "An Error Occured post: string indices must be integers"
              ) {
                setisbnError(true);
                setIsLoading(false)
              } else {
                setisbnError(false);
              }
              setemptyIsbnError(false);

              setIsbn("");
              auth.currentUser.getIdToken().then(function (idToken) {
                axios
                  .get("https://book-stats-456.herokuapp.com/list", {
                    headers: { Authorization: `Bearer ${idToken}` },
                  })
                  .then((res) => {
                    setBookAll(res.data);
                    setIsLoading(false)
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              });
            })

            .catch((error) => {
              console.error(error);
            });
        })
        .catch(function (error) {
          console.log(error);
        });
    } else {
      setemptyIsbnError(true);
      setIsLoading(false)
    }
  };
  // handle delete book button
  const deleteBook = (del_id) => {
    axios
      .post("https://book-stats-456.herokuapp.com/delete", {
        id: del_id,
      })
      .then(
        (response) => {
          auth.currentUser.getIdToken().then(function (idToken) {
            
            axios
              .get("https://book-stats-456.herokuapp.com/list", {
                headers: { Authorization: `Bearer ${idToken}` },
              })
              .then((res) => {
                setBookAll(res.data);
              })
              .catch((error) => {
                console.error(error);
              });
          });
        },
        (error) => {
          console.log(error);
        }
      );
  };
  // get word cloud
  function showStats() {
    auth.currentUser.getIdToken().then(function (idToken) {
      axios
        .get("https://book-stats-456.herokuapp.com/getStats", {
          headers: { Authorization: `Bearer ${idToken}` },
        })
        .then((res) => {
          let newImg = "data:image/png;base64," + res.data;
          setImg(newImg);
        })
        .catch((error) => {
          console.error(error);
        });
    });

    setStats(true);
  }

  // show subjects page
  if (signedIn & stats) {
    return (
      <>
        <ul className="flex justify-around bg-white">
          <li className="mr-3">
            <p className="inline-block hover:border-gray-200 text-black hover:bg-gray-200 py-2 px-4">
              <button onClick={() => backHome()}>My Books </button>
            </p>
          </li>
          <li className="mr-3">
            <p className="inline-block border border-blue-500 rounded py-2 px-4 bg-blue-500 hover:bg-blue-700 text-black">
              <button onClick={() => showStats(auth)}>My Subjects</button>
            </p>
          </li>
          <li className="mr-3">
            <p className="inline-block hover:border-gray-200 text-black hover:bg-gray-200 py-2 px-4">
              <button onClick={() => logOutUser(auth)}>Logout</button>
            </p>
          </li>
        </ul>
        <br />
        <div style={{ display: img ? "block" : "none" }}>
          <div className="flex items-center justify-center">
            <img src={img} alt="word cloud of book subjects" />
          </div>
        </div>
        <div style={{ display: !img ? "block" : "none" }}>
          <div className="flex justify-center items-center">
            <div
              className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full"
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  // show sign up form
  if (signUp & !signedIn) {
    return (
      <>
        <div className="flex justify-center items-center h-screen">
          <div className="w-full max-w-xs">
            <form class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
              <div class="mb-4">
                <div className="text-center pb-4">
                  <h1 className="custom-font text-2xl pb-2">Book Cloud</h1>
                  <FontAwesomeIcon
                    icon={faCloud}
                    color="#facc14"
                    className="fa-xl pt-2"
                  />
                </div>
                <p className="pb-3 text-red-500">{error}</p>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  defaultValue={person.email}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  type="email"
                  id="email"
                  name="email"
                  placeholder="email"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Password
                </label>
                <input
                  defaultValue={person.password}
                  onChange={handleChange}
                  type="password"
                  id="password"
                  name="password"
                  placeholder="password"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                ></input>
              </div>
              <div className="flex items-center justify-between">
                <button
                  
                  onClick={addUser}
                  className="btn bg-yellow-400 hover:bg-yellow-700 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="button"
                >
                  Sign Up
                </button>
                <button
                 
                  onClick={() => {
                    setSignUp(false);
                    setError("");
                  }}
                  className="btn inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
                  type="button"
                >
                  Log In
                </button>
              </div>
            </form>

            <p className="text-center text-gray-500 text-sm py-4">
              &copy;2022 BookCloud. All rights reserved.
            </p>
            <div className="text-center">
              <FontAwesomeIcon
                icon={faBook}
                color="#3b82f6"
                className="fa-lg px-2"
              />
              <FontAwesomeIcon
                icon={faBookOpen}
                color="#3b82f6"
                className="fa-lg px-2"
              />
            </div>
          </div>
        </div>
      </>
    );
  }
  // show login form
  if (!signedIn && !signUp) {
    return (
      <>
        <div className="flex justify-center items-center h-screen">
          <div className="w-full max-w-xs">
            <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
              <div className="mb-4">
                <div className="text-center pb-4">
                  <h1 className="custom-font text-2xl pb-2">Book Cloud</h1>
                  <FontAwesomeIcon
                    icon={faCloud}
                    color="#facc14"
                    className="fa-xl pt-2"
                  />
                </div>
                <p className="pb-3 text-red-500">{error}</p>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  defaultValue={person.email}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  type="email"
                  id="email"
                  name="email"
                  placeholder="email"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Password
                </label>
                <input
                  defaultValue={person.password}
                  onChange={handleChange}
                  type="password"
                  id="password"
                  name="password"
                  placeholder="password"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                ></input>
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  onClick={handleLoginSubmit}
                  className="btn bg-yellow-400 hover:bg-yellow-700 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Log In
                </button>

                <button
                  type="submit"
                  onClick={() => {
                    setSignUp(true);
                    setError("");
                  }}
                  className="btn inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
                >
                  Sign Up
                </button>
              </div>
              <div className="flex items-center justify-between pt-8">
                <button
                 
                  onClick={handleGoogleLogin}
                  className="btn bg-blue-500 hover:bg-blue-700 text-gray-50 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="button"
                >
                  Continue With Google
                </button>
              </div>
            </form>

            <p className="text-center text-gray-500 text-xs py-4">
              &copy;2022 BookCloud. All rights reserved.
            </p>
            <div className="text-center">
              <FontAwesomeIcon
                icon={faBook}
                color="#3b82f6"
                className="fa-lg px-2"
              />
              <FontAwesomeIcon
                icon={faBookOpen}
                color="#3b82f6"
                className="fa-lg px-2"
              />
            </div>
          </div>
        </div>
      </>
    );
  }

  // show modal for book
  if (signedIn && showModal) {
    return (
      <>
        <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
          <div className="relative w-auto my-6 mx-auto max-w-3xl">
            {/*content*/}
            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
              {/*header*/}
              <div className="p-5 border-b border-solid border-blueGray-200 rounded-t">
                <h3 className="text-xl font-semibold pr-5 ">{book.title}</h3>

                <div className="text-sm flex items-start justify-between">
                  <img src={book.img} alt="book" />
                  <p className="pl-5 hidden lg:block">{book.desc}</p>
                </div>
                <div className="flex v-screen">
                  <div className="m-auto">
                    <button
                      className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                      type="button"
                      onClick={() => setShowModal(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
      </>
    );
  }
  //show is loading spinner
  if (isLoading) {
    return (
      <>
        <div className="flex justify-center items-center">
          <div
            className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full"
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    );
  }
  // show my books page
  return (
    <div>
      <ul className="flex justify-around bg-white">
        <li className="mr-3">
          <p className="inline-block border border-blue-500 rounded py-2 px-4 bg-blue-500 hover:bg-blue-700 text-black">
            My Books
          </p>
        </li>
        <li className="mr-3">
          <p className="inline-block hover:border-gray-200 text-black hover:bg-gray-200 py-2 px-4">
            <button onClick={() => showStats(auth)}>My Subjects</button>
          </p>
        </li>
        <li className="mr-3">
          <p className="inline-block hover:border-gray-200 text-black hover:bg-gray-200 py-2 px-4">
            <button onClick={() => logOutUser(auth)}>Logout</button>
          </p>
        </li>
      </ul>

      <div className="flex items-center justify-center">
        <div className="bg-white text-black font-bold rounded-lg border shadow-lg p-10 my-10">
          <div className="flex items-center justify-center">
            <form className="m-4 flex" onSubmit={handleSubmit}>
              <input
                className="rounded-l-lg p-4 border-t mr-0 border-b border-l text-gray-800 border-gray-200 bg-white"
                placeholder="ISBN"
                type="text"
                id="isbn"
                name="isbn"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
              />

              <button
                type="submit"
                className="px-8 rounded-r-lg bg-yellow-400  text-gray-800 font-bold p-4 uppercase border-yellow-500 border-t border-b border-r"
              >
                Add Book
              </button>
            </form>
          </div>
          <div className={`${emptyIsbnError ? "visible" : "invisible"}`}>
            <div className="flex items-center justify-center">
              <p className="text-red-500 text-xs italic">
                Please enter an ISBN.
              </p>
            </div>
          </div>

          <div className={`${isbnError ? "visible" : "invisible"}`}>
            <div className="flex items-center justify-center">
              <p className="text-red-500 text-xs italic">
                Please enter a valid ISBN.
              </p>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
                <div className="overflow-x-auto">
                  <table className="w-24 min-w-full md:min-w-0">
                    <thead className="border-b">
                      <tr>
                        <th
                          scope="col"
                          className="text-sm font-medium text-gray-900 px-6 py-4 text-left "
                        >
                          ISBN
                        </th>
                        <th
                          scope="col"
                          className="text-sm font-medium text-gray-900 px-6 py-4 text-left hidden lg:table-cell"
                        >
                          Title
                        </th>
                        <th
                          scope="col"
                          className="text-sm font-medium text-gray-900 px-6 py-4 text-left hidden lg:table-cell"
                        >
                          Author
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookAll.map((bookitem) => {
                        return (
                          <tr key={bookitem.id} className="border-b">
                            <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap ">
                              {bookitem.isbn}
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap w-px hidden lg:table-cell">
                              {bookitem.title}
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                              {bookitem.author}
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                              <button onClick={() => toggleModal(bookitem.id)}>
                                View
                              </button>
                            </td>
                            <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                              <button onClick={() => deleteBook(bookitem.id)}>
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
