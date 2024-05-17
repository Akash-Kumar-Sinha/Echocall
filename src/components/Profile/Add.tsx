import getCurrentUser from "../../utils/getCurrentUser"

const Add = () => {

  const handleAddFriend = async() =>{
    try {
      // const response = await axios.post
      const user = await getCurrentUser();
      console.log(user)
    } catch (error) {
      console.log("error in sending request", error)
    }
  }

  return (
    <div className="inline-block">
    <button onClick={handleAddFriend} className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-2 px-4 rounded">
        Add Friend
    </button>
</div>


  )
}

export default Add