import type { GuruAssignment, GuruClass, GuruStudent } from "@/lib/types";
import { getCachedStudentSort } from "@/lib/student-sort-cache";
import { sortStudentsByMode } from "@/lib/student-sort";

export type ListMutationEvent =
  | { type: "class-created"; workspaceId: string; guruClass: GuruClass }
  | { type: "class-updated"; workspaceId: string; guruClass: GuruClass }
  | { type: "class-deleted"; workspaceId: string; classId: string }
  | { type: "student-created"; workspaceId: string; classId: string; student: GuruStudent }
  | { type: "student-updated"; workspaceId: string; classId: string; student: GuruStudent }
  | { type: "student-deleted"; workspaceId: string; classId: string; studentId: string }
  | {
      type: "assignment-created";
      workspaceId: string;
      classId: string;
      assignment: GuruAssignment;
    }
  | {
      type: "assignment-deleted";
      workspaceId: string;
      classId: string;
      assignmentId: string;
    };

type Listener = (event: ListMutationEvent) => void;

const listeners = new Set<Listener>();

const pendingEvents: ListMutationEvent[] = [];
const MAX_PENDING_EVENTS = 32;

function replayPending(listener: Listener) {
  if (pendingEvents.length === 0) return;
  const replay = pendingEvents.splice(0, pendingEvents.length);
  for (const event of replay) {
    listener(event);
  }
}

export function subscribeListMutations(listener: Listener): () => void {
  listeners.add(listener);
  replayPending(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitListMutation(event: ListMutationEvent): void {
  if (listeners.size === 0) {
    pendingEvents.push(event);
    if (pendingEvents.length > MAX_PENDING_EVENTS) {
      pendingEvents.shift();
    }
    return;
  }
  for (const listener of listeners) {
    listener(event);
  }
}

function sortStudents(
  students: GuruStudent[],
  workspaceId: string,
): GuruStudent[] {
  return sortStudentsByMode(students, getCachedStudentSort(workspaceId));
}

function sortClasses(classes: GuruClass[]): GuruClass[] {
  return [...classes].sort((a, b) => a.name.localeCompare(b.name, "id"));
}

export function appendStudentToList(
  students: GuruStudent[],
  student: GuruStudent,
  workspaceId: string,
): GuruStudent[] {
  if (students.some((row) => row.id === student.id)) return students;
  return sortStudents([...students, student], workspaceId);
}

export function appendClassToList(
  classes: GuruClass[],
  guruClass: GuruClass,
): GuruClass[] {
  if (classes.some((row) => row.id === guruClass.id)) return classes;
  return sortClasses([...classes, guruClass]);
}

export function appendAssignmentToList(
  assignments: GuruAssignment[],
  assignment: GuruAssignment,
): GuruAssignment[] {
  if (assignments.some((row) => row.id === assignment.id)) return assignments;
  return [...assignments, assignment];
}
