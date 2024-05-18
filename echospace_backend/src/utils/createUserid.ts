import prisma from "../db/prismaDb";

const createUserId = async (username: string) => {
    const generateRandomNumber = () => {
      return Math.floor(1000 + Math.random() * 9000);
    };
  
    let uniqueUserId: string;
    let userExists: any;
  
    do {
      const randomNumber = generateRandomNumber();
      uniqueUserId = `${username}#${randomNumber}`;
  
      userExists = await prisma.user.findUnique({
        where: { userId: uniqueUserId },
      });
    } while (userExists);
  
    return uniqueUserId;
  };

  export default createUserId