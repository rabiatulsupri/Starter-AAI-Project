// One shared PrismaClient for the server, so imports never open a
// second connection to dev.db.
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default prisma
