"use client";
import Item from "../components/item";
import React from "react";
import axios from "axios";
import {useRouter} from "next/navigation";

import app from "../config";
import { getAuth, signInWithPopup } from "firebase/auth";

export default function Home({ params }: any) {
  const router = useRouter();
  const [currUser, setCurrUser] = React.useState<string | null>("");
  const [value, setValue] = React.useState('');
  const userName = params.userid;
  const [data, setData] = React.useState<{ id: string; content: string }[]>([]);

  //  check for it
  React.useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = auth.onAuthStateChanged(async(user)=>{
      console.log("oooo",user);
      const a:any = await user?.email ;
      if(user){setCurrUser(a);}
      else{setCurrUser(null);}
    });
    console.log("check");
    console.log(currUser);
    const fetchContentData = async () => {
      try {
        const response = await axios.get('/api/contentdata',{params:{name:userName}}); 
        console.log(response.data);
        // const contents = response.data.data.map( (elem:any) => {elem.content, elem._id});
        const contents = response.data.data.map((elem:any) => ({ content: elem.content, id: elem._id }));

        console.log(contents);
        setData(contents);
      } catch (error) {
        console.error('Error fetching content data:', error);
      }
    };

    fetchContentData();
    return () =>unsubscribe();
  }, [currUser, userName]);

  const refresh = ()=>{
    window.location.reload()
  }

  
  async function logout() {
    
    // const data = await axios.get("../api/user/data");
    // console.log(data);
    // console.log(userName);
    console.log(data);
    router.push('/login');
  }

  async function add() {
    const cont = {
      userName,
      data: value,
    };
    try {
      const res = await axios.post('/api/contentupload', cont);
      console.log(res);
      const newItem = { id: res.data.data._id, content: value };
      console.log(newItem);
      setData(prevData => [newItem, ...prevData,]);
      setValue(''); // Clear the input field
    } catch (error) {
      console.log(error); 
    }

  }

  const deleteItem = async (id: string) => {
    try {
      // await axios.get('/api/contentdelete', { params: { id: id } });
      setData(prevData => prevData.filter(item => item.id !== id));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <main className="flex p-10 justify-center">
      <div className="flex flex-col w-3/4">
        <button
          onClick={logout}
          className="outline-none border-[1px] border-gray-500 text-gray-400 text-sm w-20 p-2 rounded-md m-2 hover:border-amber-500 hover:text-amber-500"
        >
          Log out
        </button>
        <div className="flex justify-center w-full gap-2.5 h-12 mb-4">
          <input
            onChange={(e) =>{
              setValue(e.target.value);
            }}
            name="content"
            value={value}
            placeholder="Enter to do item"
            className="px-2 text-sm bg-zinc-800 border-amber-90ccc0 outline-none w-full rounded-md text-gray-400"
          />
          <button onClick={add} className="px-10 py-0 rounded-md bg-amber-700 text-sm hover:bg-amber-600 text-stone-200">
            Add
          </button>
        </div>
        <button onClick={refresh} className="mb-12 outline-none border-[1px] border-gray-500 text-gray-500 rounded-md text-sm w-20 hover:border-amber-500 hover:text-amber-500">Refresh</button>
        {
          data.length > 0 ? (
            data.map((elem, index) => (
              <Item key={index} id={elem.id} cct={elem.content} onDelete={deleteItem}/>
            ))
          ) : (
            <p>No data available</p>
          )
        }
      </div>
    </main>
  );
}
