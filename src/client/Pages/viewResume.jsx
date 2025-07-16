export default function ViewResume() {
    return (
        <>
            <header className="header">
                <div className="logo">PlaceME</div>
                <nav>
                    <a href="/dashboard">Home</a>
                    <a href="/dashboard/updateprofile">My Profile</a>
                    <a href="/login">Logout</a>
                </nav>
            </header>

            <div className="browse-jobs-container">
                <h1 className="browse-jobs-title">My Resume</h1>
                <div className="job-listing">
                 <h1 className="resume-title">Contact Information</h1>   
                 <ul className="resume-list">
                    <li><strong>Name:</strong> Student name</li>
                    <li><strong>Email:</strong> Student email</li>
                    <li><strong>Phone:</strong> Student phone number</li>
                    <li><strong>Address:</strong> Student Address</li>
                 </ul>
                
                <h1 className="resume-title">Summary/Objective</h1>
                <p>Highly motivated Computer Science student with a strong foundation in software development and data analysis. Eager to apply technical skills to real-world challenges and contribute to innovative projects.</p>

                <h1 className="resume-title">Education</h1>
                <p><span className="special-text">B.Tech in Computer Science</span> | XYZ University | 2021-2025</p>

                <ul className="resume-list">
                    <li>CGPA: 8.5/10.0</li>
                    <li>
                        Relevant Courses: Data Structures & Algorithms, Object-Oriented Programming, Database Management Systems, Web Technologies.
                    </li>
                </ul>

                <h1 className="resume-title">Skills</h1>
                <ul className="resume-list">
                    <li><strong>Programming Language: </strong>Python, Java, JavaScript, C++</li>
                    <li><strong>Web Technologies: </strong>HTML, CSS, React, Node.js</li>
                    <li><strong>Databases: </strong>SQL, MongoDB</li>
                    <li><strong>Tools & Platforms: </strong>Git, VS Code, Microsoft Office</li>
                    <li><strong>Others: </strong>Data Structures, Algorithms, Problem Solving, Teamwork, Communication</li>
                </ul>

                <h1 className="resume-title">Experience</h1>
                <p><span className="special-text">Software Developer Inter</span> | Tech Solution Inc. | May 2024 - August 2024</p>

                <ul className="resume-list">
                    <li>Developed responsive front-end components for a client-facing dashboard using React.</li>
                    <li>Assisted in API integration and database management for user authentication modules.</li>
                    <li>Collaborated with a team of 5 developers in an Agile environment.</li>
                </ul>

                <p><span className="special-text">Project Intern</span> | University Research Lab | Jan 2023 - April 2023</p>

                <ul className="resume-list">
                    <li>
                        Designed and implemented a sentiment analysis tool using Python and NLTK.
                    </li>
                    <li>Processed and analyzed large text datasets to identify key emotional trends.</li>
                </ul>

                <h1 className="resume-title">Projects</h1>
                <h4>E-commerce Web Application (Full-Stack)</h4>
                <ul className="resume-list">
                    <li>Developed a complete e-commerce platform with user authentication, product catalog, shopping cart, and payment integration.</li>
                    <li>Technologies: React, Node.js, Express, MongoDB.</li>
                </ul>

                <h4>Automated Attendence System</h4>
                <ul className="resume-list">
                    <li>
                        Created a system using Python and OpenCV for facial recognition-based attendance tracking.
                    </li>
                    <li>
                        Integrated with a local database for student records.
                    </li>
                </ul>
                <div className="resume-btn">
                <button className="button">Download Resume(PDF)</button>
                <button className="button">Edit Profile / Upload New Resume</button>
                </div>
                
                </div>
            </div>
            
        </>
    )
}