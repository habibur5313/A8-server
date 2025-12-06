import { Gender } from "@prisma/client";

export type ITouristFilterRequest = {
searchTerm?: string;
email?: string;
contactNumber?: string;
country?: string;
};

export type ITouristPreferences = {
interests: string[]; // e.g. ["Food Tour", "Adventure", "Heritage"]
};

export type ITouristUpdate = {
name?: string;
email?: string;
contactNumber?: string;
country?: string;
address?: string;
profilePhoto?: string;
preferences?: string[]; // updated interests
};
