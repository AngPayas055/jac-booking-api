import jwt from 'jsonwebtoken';
import { IUser, User } from '../models/User';
require('dotenv').config()

export const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  // const token = req.headers['authorization']
  if(token == null) return res.sendStatus(401);
  
  const resp = await verifyJWT(token);

  if (!resp.success) {
    res.status(403).send({error: "Session Expired"})
    return;
  } else {
    req.user = resp.user;
    next()
  }
}

const verifyJWT = async (token: string): Promise<{ success: boolean, user?: any }> => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      process.env.JWT_SECRET!,
      async (err: jwt.VerifyErrors | null, response: string | jwt.JwtPayload | undefined) => {
        try {
          if(err || response === undefined) {
            resolve({
              success: false
            });
          }
          const user = await User.findOne({ email: response.email });
          if (!user) {
            resolve({
              success: false
            })
            return;
          }
          resolve({
            success: true,
            user: {
              id: user._id,
              email: user.email
            } as IUser
          })
        } catch (ex) {
          resolve({
            success: false
          })
        }
  })

  })
}