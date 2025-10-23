// src/server/Controllers/companyController.js

import Company from '../models/Company.js';

// Get company profile (can be fetched by company itself or others)
export const getCompanyProfile = async (req, res) => {
    try {
        const { companyId } = req.params;
        // Exclude password and verification status for public view
        const profile = await Company.findById(companyId).select('-companyPassword -isVerified');

        if (!profile) {
            return res.status(404).json({ message: 'Company profile not found.' });
        }
        res.status(200).json({ company: profile });
    } catch (error) {
        console.error('Error fetching company profile:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Update company profile (only by the company itself)
export const updateCompanyProfile = async (req, res) => {
    try {
        const { companyId } = req.params;
        const updates = req.body; // Validated by middleware
        const loggedInCompanyId = req.user.id; // From verifyToken middleware

        // Security check: Ensure the logged-in user matches the profile being updated
        if (companyId !== loggedInCompanyId) {
            return res.status(403).json({ message: 'Access denied. You can only update your own profile.' });
        }

        const updatedCompany = await Company.findByIdAndUpdate(
            companyId,
            updates,
            { new: true, runValidators: true } // Return updated doc, run schema validators
        ).select('-companyPassword'); // Exclude password from response

        if (!updatedCompany) {
            return res.status(404).json({ message: 'Company not found.' });
        }
        res.status(200).json({ message: 'Profile updated successfully!', company: updatedCompany });
    } catch (error) {
        console.error('Error updating company profile:', error);
         if (error.code === 11000) { // Handle potential unique constraint errors if any added later
             return res.status(400).json({ message: 'Update failed due to duplicate value.' });
         }
        res.status(500).json({ message: 'Internal server error.' });
    }
};