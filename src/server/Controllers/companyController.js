

import Company from '../models/Company.js';


export const getCompanyProfile = async (req, res) => {
    try {
        const { companyId } = req.params;
        
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

export const updateCompanyProfile = async (req, res) => {
    try {
        const { companyId } = req.params;
        const updates = req.body; 
        const loggedInCompanyId = req.user.id; 

        
        if (companyId !== loggedInCompanyId) {
            return res.status(403).json({ message: 'Access denied. You can only update your own profile.' });
        }

        const updatedCompany = await Company.findByIdAndUpdate(
            companyId,
            updates,
            { new: true, runValidators: true }
        ).select('-companyPassword'); 

        if (!updatedCompany) {
            return res.status(404).json({ message: 'Company not found.' });
        }
        res.status(200).json({ message: 'Profile updated successfully!', company: updatedCompany });
    } catch (error) {
        console.error('Error updating company profile:', error);
         if (error.code === 11000){
             return res.status(400).json({ message: 'Update failed due to duplicate value.' });
         }
        res.status(500).json({ message: 'Internal server error.' });
    }
};