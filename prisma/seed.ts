import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting seed...")

  // Create default user
  const hashedPassword = await bcrypt.hash("admin123", 12)
  const user = await prisma.user.upsert({
    where: { email: "admin@escoltran.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@escoltran.com",
      password: hashedPassword,
      role: "ADMIN",
      status: "ATIVO",
      userRoles: {
        create: { role: "ADMIN" },
      },
      modulePermissions: {
        create: [
          { moduleName: "pipeline", level: "FULL" },
          { moduleName: "contacts", level: "FULL" },
          { moduleName: "activities", level: "FULL" },
          { moduleName: "lead-search", level: "FULL" },
          { moduleName: "mass-messaging", level: "FULL" },
          { moduleName: "utm-analytics", level: "FULL" },
          { moduleName: "ai-insights", level: "FULL" },
        ]
      }
    },
  })

  console.log(`User created: ${user.email}`)

  // Create default pipeline
  const existingPipeline = await prisma.pipeline.findFirst({
    where: { userId: user.id },
  })

  if (!existingPipeline) {
    const pipeline = await prisma.pipeline.create({
      data: {
        name: "Pipeline Principal",
        userId: user.id,
        teamId: null, // Global or team specific
        stages: {
          create: [
            { name: "Prospecção", color: "#6b7280", order: 0, probability: 10 },
            { name: "Qualificação", color: "#f97316", order: 1, probability: 25 },
            { name: "Proposta", color: "#f59e0b", order: 2, probability: 50 },
            { name: "Negociação", color: "#8b5cf6", order: 3, probability: 75 },
            { name: "Fechamento", color: "#22c55e", order: 4, probability: 90 },
          ],
        },
      },
      include: { stages: true },
    })

    console.log(`Pipeline created: ${pipeline.name} with ${pipeline.stages.length} stages`)

    // Create some sample contacts
    const contacts = await Promise.all([
      prisma.contact.create({
        data: {
          nome: "Maria",
          sobrenome: "Silva",
          email: "maria.silva@email.com",
          telefone: "(11) 99999-0001",
          tags: ["lead", "premium"],
          lgpdConsent: true,
          userId: user.id,
          teamId: null,
        },
      }),
      prisma.contact.create({
        data: {
          nome: "João",
          sobrenome: "Santos",
          email: "joao.santos@empresa.com",
          telefone: "(11) 99999-0002",
          tags: ["cliente"],
          lgpdConsent: true,
          userId: user.id,
          teamId: null,
        },
      }),
    ])

    console.log(`Created ${contacts.length} sample contacts`)

    // Create a sample deal
    const firstStage = pipeline.stages.find((s) => s.order === 0)
    if (firstStage) {
      await prisma.deal.create({
        data: {
          titulo: "João Santos - Enterprise Deal",
          valorEstimado: 15000,
          prioridade: "ALTA",
          origem: "Google Ads",
          contactId: contacts[1].id,
          stageId: firstStage.id,
          pipelineId: pipeline.id,
          userId: user.id,
          teamId: null,
        },
      })
      console.log("Sample deal created")
    }
  }

  console.log("Seed completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
