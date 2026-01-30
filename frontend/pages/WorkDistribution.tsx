import React from 'react';
import { Card } from '../components/ui/Shared';

export const WorkDistribution = ({ user, members, prokers }: { user: any, members: any[], prokers: any[] }) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Rekap Pembagian Kerja</h1>
                    <p className="text-gray-500">Distribution of functionaries across all programs.</p>
                </div>
            </div>

            <Card className="p-0 overflow-hidden border border-gray-200 rounded-xl">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left py-4 px-6 text-gray-500 font-bold text-sm">Member Name</th>
                            <th className="text-left py-4 px-6 text-gray-500 font-bold text-sm">Department</th>
                            <th className="text-left py-4 px-6 text-gray-500 font-bold text-sm">Assigned Projects & Roles</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map((member) => {
                            // Determine projects involved
                            const involvedProjects = prokers.map(p => {
                                let role = null;
                                // 1. BPH Logic
                                if ((member.dept === 'BPH' || member.department_id === 'BPH') && ['superadmin', 'sub_super_admin_1', 'sub_super_admin_2'].includes(member.status)) {
                                    // BPH supervises everything, but usually isn't "staff"
                                    // We can skip showing all prokers for BPH unless explicitly assigned
                                    // return null; 
                                }

                                // 2. Direct Leader
                                if (p.leader === member.name || p.leader_name === member.name) {
                                    role = 'Ketua Pelaksana';
                                }
                                // 3. Sie/Division
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
                                if (p.secretary === member.name || p.secretary_name === member.name) role = 'Sekretaris';
                                if (p.treasurer === member.name || p.treasurer_name === member.name) role = 'Bendahara';

                                if (role) return { title: p.title, role };
                                return null;
                            }).filter(Boolean);

                            return (
                                <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-4 px-6 font-medium text-gray-900">{member.name}</td>
                                    <td className="py-4 px-6 text-gray-500">{member.dept || member.department?.name || '-'}</td>
                                    <td className="py-4 px-6">
                                        {involvedProjects.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {involvedProjects.map((p: any, idx: number) => (
                                                    <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {p.title}: <span className="ml-1 font-bold">{p.role}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic text-sm">No specific assignments</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};
