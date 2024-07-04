import { db, auth } from '@/lib/firebase2';

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const idToken = authHeader.split(' ')[1];

        // Verify the token using Firebase Admin SDK
        const decodedToken = await auth.verifyIdToken(idToken);
        const userId = decodedToken.uid;
        console.log(userId)

        const querySnapshot = await db.collection('voice')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        const data = querySnapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
        }));

        return new Response(JSON.stringify({ data: data }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        });
    } catch (error: any) {
        console.error('Error fetching transcriptions:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch transcriptions.' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        });
    }
}
