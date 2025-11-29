import React from 'react';
import { Card } from '../components/ui/Shared';

export const WorkDistribution = ({ user, members, prokers }: { user: any, members: any[], prokers: any[] }) => {
    // Only BPH and Kadep can edit (Mock functionality for now, as editing is done in Project Detail)
    const canEdit = ['Ketua Himpunan', 'Wakil Ketua Himpunan', 'Sekretaris Umum', 'Ketua Departemen'].includes(user.role);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Rekap Pembagian Kerja</h1>
                    <p className="text-gray-500">Distribution of functionaries across all programs.</p>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto shadow-sm">
                <table className="w-full min-w-[1200px] border-collapse">
                    <thead>
                        <tr>
                            <th className="sticky left-0 bg-white z-10 p-4 border-b border-r border-gray-200 text-left font-bold text-gray-800 w-64 shadow-lg">
                                Member Name
                            </th>
                            <th className="p-4 border-b border-gray-200 text-left font-bold text-gray-800 w-32 border-r">
                                Dept
                            </th>
                            {prokers.map(p => (
                                <th key={p.id} className="p-4 border-b border-gray-200 text-center font-bold text-blue-600 text-xs uppercase tracking-wider w-32 border-r">
                                    {p.title}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {members.map((member) => (
                            <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                <td className="sticky left-0 bg-white z-10 p-3 border-b border-r border-gray-200 font-medium text-gray-900 shadow-lg">
                                    {member.name}
                                </td>
                                <td className="p-3 border-b border-gray-200 text-gray-500 text-sm border-r">
                                    {member.dept || member.department?.name || '-'}
                                </td>
                                {prokers.map(p => {
                                    // Dynamic Logic to determine role
                                    let role = '-';

                                    // 1. Check BPH Override (Global Role)
                                    if (member.dept === 'BPH' || member.department_id === 'BPH' || member.department?.name === 'BPH') {
                                        if (member.status === 'superadmin') role = 'Ketua Himpunan';
                                        else if (member.status === 'sub_super_admin_1') role = 'Bendahara Umum';
                                        else if (member.status === 'sub_super_admin_2') role = 'Sekretaris Umum';
                                        else role = member.role; // Fallback
                                    }
                                    // 2. Check Leader
                                    else if (p.leader === member.name || p.leader_name === member.name) {
                                        role = 'Ketupel';
                                    }
                                    // 3. Check Sies (Divisions)
                                    else if (p.sies && Array.isArray(p.sies)) {
                                        for (const sie of p.sies) {
                                            if (sie.coordinator === member.name) {
                                                role = `Koord. ${sie.name}`;
                                                break;
                                            }
                                            if (sie.staff && sie.staff.includes(member.name)) {
                                                role = `Staff ${sie.name}`;
                                                break;
                                            }
                                        }
                                    }

                                    const cellColor = role === 'Ketupel' ? 'bg-blue-100 text-blue-700 font-bold' :
                                        role.startsWith('Koord') ? 'bg-purple-100 text-purple-700 font-medium' :
                                            role.startsWith('Staff') ? 'bg-gray-100 text-gray-700' :
                                                (member.dept === 'BPH' || member.department_id === 'BPH') ? 'bg-yellow-100 text-yellow-800 font-bold' : '';

                                    return (
                                        <td key={p.id} className={`p-2 border-b border-gray-200 text-center text-xs border-r ${cellColor}`}>
                                            {role !== '-' ? role : ''}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
