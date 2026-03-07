import dotenv from "dotenv";

// Load local env first for developer machines, then fallback to .env.
dotenv.config({ path: ".env.local" });
dotenv.config();

const run = async (): Promise<void> => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required. Add it to .env.local before running seed.");
  }

  const [
    { connectToDatabase },
    { UserModel },
    { BucketListModel },
    { ListItemModel },
    { InvitationModel },
    { ActivityModel },
    { hashPassword },
    { createInvitationToken, hashInvitationToken }
  ] = await Promise.all([
    import("../lib/db/mongoose"),
    import("../models/User"),
    import("../models/BucketList"),
    import("../models/ListItem"),
    import("../models/Invitation"),
    import("../models/Activity"),
    import("../lib/auth/password"),
    import("../lib/server/invitations")
  ]);

  await connectToDatabase();

  await Promise.all([
    ActivityModel.deleteMany({}),
    InvitationModel.deleteMany({}),
    ListItemModel.deleteMany({}),
    BucketListModel.deleteMany({}),
    UserModel.deleteMany({})
  ]);

  const [alex, sarah, michael, elena] = await UserModel.create([
    {
      email: "alex@example.com",
      name: "Alex Rivers",
      passwordHash: await hashPassword("Password123!")
    },
    {
      email: "sarah@example.com",
      name: "Sarah Jenkins",
      passwordHash: await hashPassword("Password123!")
    },
    {
      email: "michael@example.com",
      name: "Michael Kovic",
      passwordHash: await hashPassword("Password123!")
    },
    {
      email: "elena@example.com",
      name: "Elena Rodriguez",
      passwordHash: await hashPassword("Password123!")
    }
  ]);

  const [worldTour, careerGrowth] = await BucketListModel.create([
    {
      title: "World Tour",
      description: "Places and experiences across continents",
      owner: alex._id,
      collaborators: [
        { user: sarah._id, role: "EDITOR" },
        { user: michael._id, role: "VIEWER" }
      ]
    },
    {
      title: "Career Growth",
      description: "Skill and leadership milestones",
      owner: sarah._id,
      collaborators: [{ user: alex._id, role: "EDITOR" }]
    }
  ]);

  const [skydive, northernLights, conferenceTalk] = await ListItemModel.create([
    {
      listId: worldTour._id,
      title: "Skydive in Dubai",
      completed: false,
      createdBy: alex._id
    },
    {
      listId: worldTour._id,
      title: "See the Northern Lights",
      completed: true,
      completedAt: new Date(),
      createdBy: sarah._id
    },
    {
      listId: careerGrowth._id,
      title: "Speak at a tech conference",
      completed: false,
      createdBy: sarah._id
    }
  ]);

  const invitationToken = createInvitationToken();
  const pendingInvitation = await InvitationModel.create({
    listId: worldTour._id,
    senderId: alex._id,
    recipientEmail: elena.email,
    role: "VIEWER",
    tokenHash: hashInvitationToken(invitationToken),
    status: "pending",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
  });

  await InvitationModel.create({
    listId: careerGrowth._id,
    senderId: sarah._id,
    recipientEmail: alex.email,
    role: "EDITOR",
    tokenHash: hashInvitationToken(createInvitationToken()),
    status: "accepted",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
  });

  await ActivityModel.create([
    {
      listId: worldTour._id,
      actorId: alex._id,
      action: "INVITATION_SENT",
      itemTitle: elena.email
    },
    {
      listId: careerGrowth._id,
      actorId: sarah._id,
      action: "INVITATION_SENT",
      itemTitle: alex.email
    },
    {
      listId: careerGrowth._id,
      actorId: alex._id,
      action: "COLLABORATOR_JOINED",
      itemTitle: alex.name
    },
    {
      listId: worldTour._id,
      actorId: sarah._id,
      action: "ITEM_COMPLETED",
      itemId: northernLights._id,
      itemTitle: northernLights.title
    },
    {
      listId: worldTour._id,
      actorId: alex._id,
      action: "ITEM_UNCOMPLETED",
      itemId: skydive._id,
      itemTitle: skydive.title
    },
    {
      listId: careerGrowth._id,
      actorId: sarah._id,
      action: "ITEM_UNCOMPLETED",
      itemId: conferenceTalk._id,
      itemTitle: conferenceTalk.title
    }
  ]);

  console.info("Seed complete");
  console.info("Demo users: alex@example.com, sarah@example.com, michael@example.com, elena@example.com");
  console.info("Password for all demo users: Password123!");
  console.info("Demo invitation token for Elena:", invitationToken);
  console.info("Pending invitation id for Elena:", pendingInvitation._id.toString());
};

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
