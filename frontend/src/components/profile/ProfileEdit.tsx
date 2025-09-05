import React from "react";
import { Formik, Form, FieldArray, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Profile } from "../../types/profile";
import "./ProfileEdit.css";

interface ProfileEditProps {
  initialProfile: Profile;
  onSave: (profile: Profile) => void;
}

const ProfileSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  title: Yup.string().required("Title is required"),
  affiliation: Yup.string().required("Affiliation is required"),
  hIndex: Yup.number().min(0, "H-Index must be 0 or positive").nullable(),
  researchInterests: Yup.array().of(Yup.string().required("Interest cannot be empty")),
  awards: Yup.array().of(Yup.string()),
  socialLinks: Yup.object().shape({
    orcid: Yup.string()
      .nullable()
      .transform((currentValue) => {
        if (!currentValue) return null;
        const doesNotStartWithHttp = !currentValue.startsWith('http://') && !currentValue.startsWith('https://');
        if (doesNotStartWithHttp) {
          return `https://${currentValue}`;
        }
        return currentValue;
      })
      .test('is-orcid-domain', 'Must be a valid ORCID URL (orcid.org)', function(value) {
        if (!value) return true;
        return value.includes('orcid.org');
      })
      .url("Invalid URL format"),
    googleScholar: Yup.string()
      .nullable()
      .transform((currentValue) => {
        if (!currentValue) return null;
        const doesNotStartWithHttp = !currentValue.startsWith('http://') && !currentValue.startsWith('https://');
        if (doesNotStartWithHttp) {
          return `https://${currentValue}`;
        }
        return currentValue;
      })
      .test('is-scholar-domain', 'Must be a valid Google Scholar URL (scholar.google.com)', function(value) {
        if (!value) return true;
        return value.includes('scholar.google.com');
      })
      .url("Invalid URL format"),
    linkedIn: Yup.string()
      .nullable()
      .transform((currentValue) => {
        if (!currentValue) return null;
        const doesNotStartWithHttp = !currentValue.startsWith('http://') && !currentValue.startsWith('https://');
        if (doesNotStartWithHttp) {
          return `https://${currentValue}`;
        }
        return currentValue;
      })
      .test('is-linkedin-domain', 'Must be a valid LinkedIn URL (linkedin.com)', function(value) {
        if (!value) return true;
        return value.includes('linkedin.com');
      })
      .url("Invalid URL format"),
    github: Yup.string()
      .nullable()
      .transform((currentValue) => {
        if (!currentValue) return null;
        const doesNotStartWithHttp = !currentValue.startsWith('http://') && !currentValue.startsWith('https://');
        if (doesNotStartWithHttp) {
          return `https://${currentValue}`;
        }
        return currentValue;
      })
      .test('is-github-domain', 'Must be a valid GitHub URL (github.com)', function(value) {
        if (!value) return true;
        return value.includes('github.com');
      })
      .url("Invalid URL format"),
  }),
});

const ProfileEdit: React.FC<ProfileEditProps> = ({ initialProfile, onSave }) => {
  return (
    <div className="profile-edit-container">
      <Formik
        initialValues={{
          ...initialProfile,
          isPublic: initialProfile.isPublic.toString()
        }}
        validationSchema={ProfileSchema}
        onSubmit={(values: any, { setSubmitting }) => {
          const profileData: Profile = {
            ...values,
            hIndex: values.hIndex === "" || values.hIndex === undefined ? null : Number(values.hIndex),
            isPublic: values.isPublic === "true"
          };
          onSave(profileData);
          setSubmitting(false);
        }}
      >
        {({
          values,
          errors,
          isSubmitting,
        }: {
          values: any;
          errors: any;
          isSubmitting: boolean;
        }) => (
          <Form className="profile-edit-form">
            {/* Basic Information */}
            <div className="form-section">
              <h3 className="section-title">
                👤 Basic Information
              </h3>
              
              <div className="form-group">
                <label className="form-label required">Name</label>
                <Field name="name" className="form-input" placeholder="Enter your full name" />
                <div className="error-container">
                  <ErrorMessage name="name" component="div" className="error-message" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label required">Title</label>
                <Field name="title" className="form-input" placeholder="e.g., PhD Student, Professor, Researcher" />
                <div className="error-container">
                  <ErrorMessage name="title" component="div" className="error-message" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label required">Affiliation</label>
                <Field name="affiliation" className="form-input" placeholder="Your institution or organization" />
                <div className="error-container">
                  <ErrorMessage name="affiliation" component="div" className="error-message" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">H-Index (optional)</label>
                <Field name="hIndex" type="number" className="form-input" placeholder="Enter your H-Index" />
                <div className="error-container">
                  <ErrorMessage name="hIndex" component="div" className="error-message" />
                </div>
              </div>
            </div>

            {/* Research Interests */}
            <div className="form-section">
              <h3 className="section-title">
                ⌬ Research Interests
              </h3>
              <FieldArray name="researchInterests">
                {({
                  push,
                  remove,
                }: {
                  push: (value: string) => void;
                  remove: (index: number) => void;
                }) => (
                  <div className="dynamic-field-container">
                    {values.researchInterests.map((_: string, index: number) => (
                      <div key={index} className="dynamic-field-item">
                        <Field 
                          name={`researchInterests.${index}`} 
                          className="form-input" 
                          placeholder="e.g., Machine Learning, Artificial Intelligence"
                        />
                        <button 
                          type="button" 
                          onClick={() => remove(index)}
                          className="remove-btn"
                          title="Remove interest"
                        >
                          ✕
                        </button>
                        <ErrorMessage name={`researchInterests.${index}`} component="div" className="error-message" />
                      </div>
                    ))}
                    <button 
                      type="button" 
                      onClick={() => push("")}
                      className="add-btn"
                    >
                      ➕ Add Research Interest
                    </button>
                  </div>
                )}
              </FieldArray>
            </div>

            {/* Awards */}
            <div className="form-section">
              <h3 className="section-title">
                𐃯 Awards & Achievements
              </h3>
              <FieldArray name="awards">
                {({
                  push,
                  remove,
                }: {
                  push: (value: string) => void;
                  remove: (index: number) => void;
                }) => (
                  <div className="dynamic-field-container">
                    {values.awards.map((_: string, index: number) => (
                      <div key={index} className="dynamic-field-item">
                        <Field 
                          name={`awards.${index}`} 
                          className="form-input" 
                          placeholder="e.g., Best Paper Award 2023"
                        />
                        <button 
                          type="button" 
                          onClick={() => remove(index)}
                          className="remove-btn"
                          title="Remove award"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button 
                      type="button" 
                      onClick={() => push("")}
                      className="add-btn"
                    >
                      🎖 Add Award
                    </button>
                  </div>
                )}
              </FieldArray>
            </div>

            {/* Social Links */}
            <div className="form-section">
              <h3 className="section-title">
                🖇 Academic & Social Links
              </h3>
              <div className="social-links-grid">
                <div className="form-group">
                  <label className="form-label">
                    ORCID
                  </label>
                  <Field 
                    name="socialLinks.orcid" 
                    className="form-input" 
                    placeholder="orcid.org/0000-0000-0000-0000" 
                  />
                  <div className="error-container">
                    <ErrorMessage name="socialLinks.orcid" component="div" className="error-message" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Google Scholar
                  </label>
                  <Field 
                    name="socialLinks.googleScholar" 
                    className="form-input" 
                    placeholder="scholar.google.com/citations?user=..." 
                  />
                  <div className="error-container">
                    <ErrorMessage name="socialLinks.googleScholar" component="div" className="error-message" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    LinkedIn
                  </label>
                  <Field 
                    name="socialLinks.linkedIn" 
                    className="form-input" 
                    placeholder="www.linkedin.com/in/yourprofile" 
                  />
                  <div className="error-container">
                    <ErrorMessage name="socialLinks.linkedIn" component="div" className="error-message" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    GitHub
                  </label>
                  <Field 
                    name="socialLinks.github" 
                    className="form-input" 
                    placeholder="github.com/yourusername" 
                  />
                  <div className="error-container">
                    <ErrorMessage name="socialLinks.github" component="div" className="error-message" />
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="form-section">
              <h3 className="section-title">
                ꗃ Privacy Settings
              </h3>
              <div className="form-group">
                <label className="form-label">Profile Visibility</label>
                <Field as="select" name="isPublic" className="form-select">
                  <option value="true">🗺 - Public</option>
                  <option value="false">ꗃ - Private </option>
                </Field>
                <p className="privacy-help">
                  Private profiles only show name, title, affiliation, and research interests.
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`btn btn-primary ${isSubmitting ? 'btn-loading' : ''}`}
              >
                {isSubmitting ? 'Saving...' : '⎙ Save Profile'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ProfileEdit;
