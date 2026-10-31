import { createFileRoute } from "@tanstack/react-router";
import { StudyApp } from "../features/study/study-app";
export const Route = createFileRoute("/")({ component: StudyApp });
