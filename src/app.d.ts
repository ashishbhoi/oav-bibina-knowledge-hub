// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

// Database types
interface DbClass {
    id: number;
    name: string;
    created_at: string;
}

interface DbSubject {
    id: number;
    name: string;
    class_id: number;
    created_at: string;
}

interface DbFileType {
    id: number;
    name: string;
    created_at: string;
}

interface DbNote {
    id: number;
    display_name: string;
    r2_object_key: string;
    class_id: number;
    subject_id: number;
    file_type_id: number;
    uploaded_at: string;
}

interface DbAdmin {
    id: number;
    username: string;
    password_hash: string;
}

// Extended types with joined data
interface ClassWithSubjects extends DbClass {
    subjects?: SubjectWithNotes[];
}

interface SubjectWithNotes extends DbSubject {
    notes?: NoteWithDetails[];
    class_name?: string;
}

interface NoteWithDetails extends DbNote {
    class_name?: string;
    subject_name?: string;
    file_type_name?: string;
}

// Session data
interface SessionData {
    userId: number;
    username: string;
}

declare global {
    namespace App {
        interface Platform {
            env: Env;
            cf: CfProperties;
            ctx: ExecutionContext;
        }

        interface Locals {
            user?: SessionData;
        }
    }
}

export {};
