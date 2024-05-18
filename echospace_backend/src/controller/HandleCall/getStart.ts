import { Request, Response } from "express";
import prisma from "../../db/prismaDb";

const getStart = async (req: Request, res: Response) =>{
    try {
        const { senderUserId, receiverUsername, callId } = req.body;
    
        const sendUser = await prisma.user.findUnique({
            where:{
                userId: senderUserId
            }
        })
        if(!sendUser){
            return res.status(404).send({message: "sender User not found"});
        }
        const receiverUser = await prisma.user.findUnique({
            where:{
                username: receiverUsername
            }
        })
        if(!receiverUser){
            return res.status(404).send({message: "Receiver User not found"});
        }
    
        const callConnection = await prisma.call.create({
            data:{
                callId: callId,
                callActive: true,
                callInitiater: senderUserId,
                callReceiver: receiverUsername,
                callReceived: true
            }
        });
        
        if (callConnection) {
            return res.status(200).send({ message: "OK" });
        } else {
            return res.status(500).send({ message: "Unable to make a call" });
        }
    } catch (error) {
        return res.status(500).send({message: "Internal Server Error"})
    }
}

export default getStart;