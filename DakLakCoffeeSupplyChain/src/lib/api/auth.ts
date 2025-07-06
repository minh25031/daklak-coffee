import { jwtDecode } from "jwt-decode";
import { roleSlugMap } from "@/lib/constrant/role";
import api from "./axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface DecodedToken {
  nameid: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  phone: string;
  roleId: number;
  companyName?: string;
  taxId?: string;
  businessLicenseURl?: string;
}

export async function login(email: string, password: string): Promise<DecodedToken> {


  localStorage.setItem("token", token);
  localStorage.setItem("user_id", decoded.nameid);
  localStorage.setItem("email", decoded.email);
  localStorage.setItem("user_role", roleSlug);
  localStorage.setItem("user_role_raw", decoded.role);


}



export async function signUp(signUpData: SignUpData): Promise<void> {

  localStorage.setItem("pending_email", signUpData.email);
}

export async function resendVerificationEmail(email: string): Promise<void> {

