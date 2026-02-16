
src/features/admin/pages/AdminDashboardPage.tsx:10:8 - error TS6133: 'AssignmentItem' is declared but its value is never read.

10   type AssignmentItem,
          ~~~~~~~~~~~~~~

src/features/admin/pages/AdminDashboardPage.tsx:49:7 - error TS6133: 'roleBadgeClass' is declared but its value is never read.  

49 const roleBadgeClass = (role: string) => {
         ~~~~~~~~~~~~~~

src/features/admin/pages/AdminDashboardPage.tsx:65:10 - error TS6133: 'showViewModal' is declared but its value is never read.  

65   const [showViewModal, setShowViewModal] = useState(false);
            ~~~~~~~~~~~~~

src/features/admin/pages/AdminDashboardPage.tsx:65:25 - error TS6133: 'setShowViewModal' is declared but its value is never read.

65   const [showViewModal, setShowViewModal] = useState(false);
                           ~~~~~~~~~~~~~~~~

src/features/admin/pages/AdminDashboardPage.tsx:66:10 - error TS6133: 'selectedUser' is declared but its value is never read.   

66   const [selectedUser, setSelectedUser] = useState<any>(null);
            ~~~~~~~~~~~~

src/features/admin/pages/AdminDashboardPage.tsx:66:24 - error TS6133: 'setSelectedUser' is declared but its value is never read.
66   const [selectedUser, setSelectedUser] = useState<any>(null);
                          ~~~~~~~~~~~~~~~

src/features/admin/pages/AdminDashboardPage.tsx:69:10 - error TS6133: 'loading' is declared but its value is never read.        

69   const [loading, setLoading] = useState(true);
            ~~~~~~~

src/features/admin/pages/AdminDashboardPage.tsx:159:9 - error TS6133: 'pausedQuizzes' is declared but its value is never read.  

159   const pausedQuizzes = quizzes.filter(i => i.isActive === false).length;
            ~~~~~~~~~~~~~


Found 8 errors.