import getUser from "../utils/getUser";

const SpaceHome = () => {
  const user = getUser();
  console.log(user);
  return (
      <li className="flex items-center gap-4 p-2 bg-neutral-800 ring-2 rounded-2xl ring-yellow-800 cursor-pointer transition duration-300 ease-in-out transform hover:rotate-3 hover:bg-yellow-700 hover:text-yellow-600 hover:shadow-lg">
        
      </li>
  );
};

export default SpaceHome;
