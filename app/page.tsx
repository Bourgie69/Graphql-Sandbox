"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useState } from "react";

const GET_SCHOOLS = gql`
  query {
    schools {
      id
      name
    }
  }
`;

type SchoolType = {
  id: string;
  name: string;
};
type GetSchoolsResponse = {
  schools: SchoolType[];
};

export default function Home() {
  const { data, loading, error } = useQuery<GetSchoolsResponse>(GET_SCHOOLS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      {data?.schools.map((school) => (
        <div key={school.id}>{school.name}</div>
      ))}
    </div>
  );
}
