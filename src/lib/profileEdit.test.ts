import { describe, expect, it } from "vitest";
import { readEditProfileForm, validateEditProfile, type EditProfileValues } from "./profileEdit";

const TODAY = "2026-10-01";

const VALID: EditProfileValues = {
  firstName: "Lucas",
  lastName: "Silva",
  username: "lucas.bt",
  birthDate: "1990-05-12",
};

describe("readEditProfileForm", () => {
  it("lê os campos sem espaços nas pontas e trata campo ausente como vazio", () => {
    const formData = new FormData();
    formData.set("firstName", "  Lucas ");
    formData.set("lastName", "Silva");
    formData.set("username", "lucas.bt");

    expect(readEditProfileForm(formData)).toEqual({
      firstName: "Lucas",
      lastName: "Silva",
      username: "lucas.bt",
      birthDate: "",
    });
  });
});

describe("validateEditProfile", () => {
  it("sem erro devolve null", () => {
    expect(validateEditProfile(VALID, TODAY)).toBeNull();
  });

  it("data de nascimento vazia vale: é opcional", () => {
    expect(validateEditProfile({ ...VALID, birthDate: "" }, TODAY)).toBeNull();
  });

  it("@username vazio não vale, ao contrário do cadastro", () => {
    expect(validateEditProfile({ ...VALID, username: "" }, TODAY)).toEqual({
      username: "Nome de usuário é obrigatório",
    });
  });

  it("devolve só os campos com erro", () => {
    expect(validateEditProfile({ ...VALID, firstName: "", birthDate: "2030-01-01" }, TODAY)).toEqual({
      firstName: "Nome é obrigatório",
      birthDate: "A data de nascimento não pode ser no futuro",
    });
  });
});
