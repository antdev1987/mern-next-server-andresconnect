import jwt from 'jsonwebtoken'

export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d'
    }
  )
}



//middleware to check authentication
export const isAuth = (req, res, next) => {

  console.log('verificando ingreso')

  const authorization = req.headers.authorization
  const token = authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'no token, authorization denied' })
  }

  try {

    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) {
        return res.status(401).json({ message: 'Token is not valid' })
      } else {
        req.user = decoded;
        next()
      }
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Server Error in auth token' })
  }


}


export const isAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(401).send({ message: 'you are not an Admin' })
  }

  next()
}