"use client";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar.tsx";
import FilterStatus from "./FilterStatus.tsx";
import LessonCard from "./clsaaCard.tsx";
import Header from "../Home/Header.tsx";
import Sidebar from "../Home/Sidebar.tsx";
import Server_url from "../../config.js";
import '../Home/Style.css';
import { useView } from "../../Context/ViewContext.tsx";

// Define an interface for the classroom data from the API
interface Classroom {
  id: string;
  title: string;
  description: string;
  image_url: string;
  teacher: string;
  students_count?: number;
  status?: 'ACCEPTED' | 'PENDING' | 'INVITED' | 'REJECTED' | 'REQUESTED' | 'ENROLLED' | null;
  membership_id?: string; // ID of the membership/invitation
}

function Lessons() {
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { currentUser, isLoadingUser } = useView();

  const fetchMembershipsForClass = async (classId: string) => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`${Server_url}/api/classrooms/classroom/${classId}/memberships/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log(`Raw Memberships Response for class ${classId}:`, response);
      const data = await response.json();
      console.log(`Parsed Memberships Data for class ${classId}:`, data);

      if (Array.isArray(data)) {
        return data;
      } else if (data && data.results && Array.isArray(data.results)) {
        return data.results;
      } else {
        console.warn(`Unexpected memberships data structure for class ${classId}:`, data);
        return [];
      }
    } catch (error) {
      console.error(`Error fetching memberships for class ${classId}:`, error);
      return [];
    }
  };

  const fetchClassesWithMemberships = async () => {
    const token = localStorage.getItem('authToken');
    setLoading(true);
    try {
      const response = await fetch(`${Server_url}/api/classrooms/classroom/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const classesData: Classroom[] = await response.json();
      console.log("Fetched classesData:", classesData);

      const classesWithMemberships = await Promise.all(
        classesData.map(async (cls) => {
          const memberships = await fetchMembershipsForClass(cls.id);
          console.log(`Memberships for class ${cls.id} (${cls.title}):`, memberships);

          if (!currentUser || !currentUser.email) {
            console.log("No currentUser or email for class:", cls.title);
            return { ...cls, status: null, id: undefined };
          }
          const myMembership = memberships.find(
            (m: any) => m.student === currentUser.email
          );
          console.log(
            `For class "${cls.title}", found myMembership:`,
            myMembership
          );
          return {
            ...cls,
            status: myMembership?.status ?? null,
            membership_id: myMembership?.id, // <-- Use membership_id instead
            // Don't overwrite cls.id - keep the original classroom id
          };
        })
      );
      console.log("Classes with user membership info:", classesWithMemberships);
      setClasses(classesWithMemberships);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      console.error("fetchClassesWithMemberships error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoadingUser && currentUser && currentUser.email) {
      fetchClassesWithMemberships();
    }
  }, [isLoadingUser, currentUser]);

  const handleMembershipAction = async (
    classId: string,
    action: 'request' | 'withdraw' | 'accept' | 'decline',
    membershipId?: string
  ) => {
    console.log("classId:", classId, "action:", action, "membershipId:", membershipId);
    const token = localStorage.getItem('authToken');
    if (!currentUser?.email) {
      setError("User not identified. Cannot perform this action.");
      console.error("No currentUser.email");
      return;
    }

    let url = '';
    let method = 'POST';
    let body: any = null;

    try {
      switch (action) {
        case 'request':
          url = `${Server_url}/api/classrooms/classroom/join-request/`;
          method = 'POST';
          body = { classroom: classId };
          break;
        case 'accept':
        case 'decline':
          if (!membershipId) throw new Error("Membership ID is required.");
          url = `${Server_url}/api/classrooms/classroom/membership/${membershipId}/respond/`;
          method = 'PUT';
          body = { action: action === 'accept' ? 'accept' : 'reject' };
          break;
        case 'withdraw':
          if (!membershipId) throw new Error("Membership ID is required.");
          url = `${Server_url}/api/classrooms/classroom/membership/${membershipId}/respond/`;
          method = 'PUT';
           body = { action: 'reject' };
          break;
        default:
          return;
      }

      console.log("Sending request:", { url, method, body });

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: body && method !== 'DELETE' ? JSON.stringify(body) : null,
      });

      console.log("API raw response:", response);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error response:", errorData);
        throw new Error(errorData.detail || 'API request failed');
      }

      if (response.status === 204) {
        console.log("204 No Content, clearing membership for class:", classId);
        setClasses(prevClasses =>
          prevClasses.map(cls =>
            cls.id === classId
              ? { ...cls, status: null, id: undefined }
              : cls
          )
        );
      } else if (action === 'request') {
        let updatedMembership;
        try {
          updatedMembership = await response.json();
          console.log("Join request response JSON:", updatedMembership);
        } catch (e) {
          updatedMembership = null;
          console.error("Error parsing join request response JSON:", e);
        }
        setClasses(prevClasses =>
          prevClasses.map(cls =>
            cls.id === classId
              ? {
                  ...cls,
                  status: 'PENDING',
                  id: updatedMembership?.id,
                }
              : cls
          )
        );
      } else {
        const updatedMembership = await response.json();
        console.log("Membership action response JSON:", updatedMembership);
        setClasses(prevClasses =>
          prevClasses.map(cls =>
            cls.id === classId
              ? {
                  ...cls,
                  status: updatedMembership.status,
                  id: updatedMembership.id,
                }
              : cls
          )
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      console.error("handleMembershipAction error:", err);
    }
  };

  const getButtonProps = (cls: Classroom) => {
    console.log(
      "Button logic for class:",
      cls.title,
      "| Status:",
      cls.status,
      "| Classroom ID:",
      cls.id, // This is now the classroom id
      "| Membership ID:",
      cls.membership_id // This is the membership id
    );
    switch (cls.status) {
      case 'ENROLLED':
      case 'ACCEPTED':
        return [{ variant: 'outline', label: 'View Class', onClick: () => navigate(`/classes/${cls.id}/students`) }];
      case 'PENDING':
      case 'REQUESTED':
        return [{ variant: 'gray', label: 'Withdraw Request', onClick: () => handleMembershipAction(cls.id, 'withdraw', cls.membership_id) }];
      case 'INVITED':
        return [
          { variant: 'green', label: 'Approve', onClick: () => handleMembershipAction(cls.id, 'accept', cls.membership_id) },
          { variant: 'red', label: 'Decline', onClick: () => handleMembershipAction(cls.id, 'decline', cls.membership_id) }
        ];
      case 'REJECTED':
      case null:
      case undefined:
      default:
        return [{
          variant: 'blue',
          label: 'Request to Join',
          onClick: () => handleMembershipAction(cls.id, 'request') // classroom id only
        }];
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <section className="dashboard-content">
        <Header />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "40px", justifyContent: "space-between", alignItems: "flex-end", width: "100%" }}>
          <div style={{ paddingTop: "16px", fontSize: "14px", minWidth: "240px", color: "#64748B", width: "330px" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", maxWidth: "100%", minHeight: "48px", width: "330px" }}>
              <SearchBar />
            </div>
          </div>
          <FilterStatus />
        </div>

        <main style={{ marginTop: "16px", width: "100%" }}>
          {loading && <p>Loading classes...</p>}
          {error && <p style={{ color: 'red' }}>Error: {error}</p>}
          {!loading && !error && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "flex-start" }}>
              {classes.length > 0 ? (
                classes.map((cls) => {
                  const buttons = getButtonProps(cls);
                  return (
                    <LessonCard
                      key={cls.id}
                      title={cls.title}
                      description={cls.description}
                      instructorName={cls.teacher}
                      studentCount={cls.students_count || 0}
                      imageUrl={cls.image_url || 'https://via.placeholder.com/300x150'}
                      buttons={buttons}
                      instructorImage="https://cdn.builder.io/api/v1/image/assets/TEMP/dd67f6684cf9b20459da76c3b0ed19da63d41bf0?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
                      studentsImage="https://cdn.builder.io/api/v1/image/assets/TEMP/78e55b3a1644eb4a5df84ada4e201496061b5a02?placeholderIfAbsent=true&apiKey=c188224ad6fd4a1e9cd2698c98d29775"
                    />
                  );
                })
              ) : (
                <p>No classes found.</p>
              )}
            </div>
          )}
        </main>
      </section>
    </div>
  );
}

export default Lessons;