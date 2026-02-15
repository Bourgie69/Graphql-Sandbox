import prisma from "@/app/lib/prisma";
import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { gql } from "graphql-tag";

const typeDefs = gql`
  type Student {
    id: String!
    firstname: String!
    lastname: String!
    last4Reg: String!
    teacherId:String!
    teacher: Teacher!
    schoolId: String!
    school: School!
    participations: [Participation!]!
    createdAt: String!
  }

  type Teacher {
    id: String!
    firstname: String!
    lastname: String!
    last4Reg: String
    schoolId: String!
    school: School
    students: [Student]
  }

  type School {
    id: String!
    name: String!
  }

  type Participation {
    id: String!
    olympiadId: String!
    olympiad: Olympiad!
    studentId: String!
    student: Student!
  }

  type Olympiad {
    id: String!
    name: String!
    date: String!
    participation: [Participation!]!
  }

  type Query {
    schools: [School!]!
    school(id: String!): School
    teachers: [Teacher!]!
    teacher(id: String!): Teacher
    students: [Student!]!
    student(id: String!): Student
    participation(id: String!): Participation
    participationByOlympiad(olympiadId: String!): Participation!
    olympiad(id: String!): Olympiad
  }

  input CreateSchoolInput {
    name: String!
  }
  input CreateTeacherInput {
    firstname: String!
    lastname: String!
    last4Reg: String!
    schoolId: String!
  }
  input CreateStudentInput {
    firstname: String!
    lastname: String!
    last4Reg: String!
    schoolId: String!
    teacherId: String!
  }

  input CreateOlympiadInput {
    name: String!
  }

  input CreateParticipationInput {
    studentId: String!
    olympiadId: String!
  }

  type Mutation {
    createSchool(input: CreateSchoolInput!): School!
    createTeacher(input: CreateTeacherInput!): Teacher!
    createStudent(input: CreateStudentInput!): Student!
    createOlympiad(input: CreateOlympiadInput!): Olympiad!
    createParticipation(input: CreateParticipationInput!): Participation!
  }
`;

const resolvers = {
  Query: {
    schools: async () => {
      return prisma.school.findMany();
    },

    school: async (_: any, args: { id: string }) => {
      return prisma.school.findUnique({
        where: { id: args.id },
      });
    },

    teachers: async (_: any, args: { id: string }) => {
      return prisma.teacher.findMany({
        include: {
          students: true,
        },
      });
    },
    teacher: async (_: any, args: { id: string }) => {
      return prisma.teacher.findUnique({
        where: { id: args.id },
        include: {
          school: true,
          students: {
            include: {
              participations: {
                include: {
                  olympiad: true,
                },
              },
            },
          },
        },
      });
    },

    students: async () => {
      return prisma.student.findMany({
        include: {
          teacher: true,
          school: true,
          participations: {
            include: {
              olympiad: true,
            },
          },
        },
      });
    },

    student: async (_: any, args: { id: string }) => {
      return prisma.student.findUnique({
        where: { id: args.id },

        include: {
          teacher: true,
          school: true,
          participations: {
            include: {
              olympiad: true,
            },
          },
        },
      });
    },

    participationByOlympiad: async (
      _: any,
      args: {
        olympiadId: string;
      },
    ) => {
        return prisma.participation.findMany({
          where: {olympiadId: args.olympiadId},
          include: {
            student: true
          }
        })
    },

    participation: async (_: any, args: { id: string }) => {
      return prisma.participation.findUnique({
        where: { id: args.id },
        include: {
          olympiad: true,
        },
      });
    },

    olympiad: async (_: any, args: { id: string }) => {
      return prisma.olympiad.findUnique({
        where: { id: args.id },
      });
    },
  },
  Mutation: {
    createSchool: async (
      _: any,
      args: {
        input: { name: string };
      },
    ) => {
      return prisma.school.create({
        data: {
          name: args.input.name,
        },
      });
    },
    createTeacher: async (
      _: any,
      args: {
        input: {
          firstname: string;
          lastname: string;
          last4Reg: string;
          schoolId: string;
        };
      },
    ) => {
      return prisma.teacher.create({
        data: {
          firstname: args.input.firstname,
          lastname: args.input.lastname,
          last4Reg: args.input.last4Reg,
          schoolId: args.input.schoolId,
        },
        include: {
          school: true,
        },
      });
    },

    createStudent: async (
      _: any,
      args: {
        input: {
          firstname: string;
          lastname: string;
          last4Reg: string;
          schoolId: string;
          teacherId: string;
        };
      },
    ) => {
      return prisma.student.create({
        data: {
          firstname: args.input.firstname,
          lastname: args.input.lastname,
          last4Reg: args.input.last4Reg,
          teacher: {
            connect: { id: args.input.teacherId },
          },
          school: {
            connect: { id: args.input.schoolId },
          },
        },
        include: {
          teacher: true,
          school: true,
        },
      });
    },

    createOlympiad: async (
      _: any,
      args: {
        input: {
          name: string;
        };
      },
    ) => {
      return prisma.olympiad.create({
        data: {
          name: args.input.name,
        },
        include: {
          participation: true,
        },
      });
    },

    createParticipation: async (
      _: any,
      args: {
        input: {
          olympiadId: string;
          studentId: string;
        };
      },
    ) => {
      return prisma.participation.create({
        data: {
          olympiad: {
            connect: { id: args.input.olympiadId },
          },
          student: {
            connect: { id: args.input.studentId },
          },
        },

        include: {
          olympiad: true,
          student: true,
        },
      });
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler(server);

export { handler as GET, handler as POST };
