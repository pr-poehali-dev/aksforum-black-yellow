'''
Business: API для управления жалобами игроков на форуме AKSGOD
Args: event - dict с httpMethod, body, queryStringParameters, pathParams
      context - object с атрибутами request_id, function_name
Returns: HTTP response dict с statusCode, headers, body
'''

import json
import os
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        if method == 'GET':
            conn = get_db_connection()
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute(
                'SELECT id, player_nickname, server, title, description, image_url, status, admin_response, created_at FROM complaints ORDER BY created_at DESC'
            )
            complaints = cursor.fetchall()
            cursor.close()
            conn.close()
            
            result = []
            for complaint in complaints:
                result.append({
                    'id': complaint['id'],
                    'playerNickname': complaint['player_nickname'],
                    'server': complaint['server'],
                    'title': complaint['title'],
                    'description': complaint['description'],
                    'imageUrl': complaint['image_url'],
                    'status': complaint['status'],
                    'adminResponse': complaint['admin_response'],
                    'createdAt': complaint['created_at'].isoformat() if complaint['created_at'] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            conn = get_db_connection()
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute(
                '''INSERT INTO complaints (player_nickname, server, title, description, image_url, status) 
                   VALUES (%s, %s, %s, %s, %s, 'pending') RETURNING id, created_at''',
                (
                    body_data['playerNickname'],
                    body_data['server'],
                    body_data['title'],
                    body_data['description'],
                    body_data.get('imageUrl')
                )
            )
            result = cursor.fetchone()
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'id': result['id'],
                    'createdAt': result['created_at'].isoformat()
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            path_params = event.get('pathParams', {})
            complaint_id = path_params.get('id')
            body_data = json.loads(event.get('body', '{}'))
            
            conn = get_db_connection()
            cursor = conn.cursor()
            
            if 'status' in body_data:
                cursor.execute(
                    'UPDATE complaints SET status = %s WHERE id = %s',
                    (body_data['status'], complaint_id)
                )
            
            if 'adminResponse' in body_data:
                cursor.execute(
                    'UPDATE complaints SET admin_response = %s WHERE id = %s',
                    (body_data['adminResponse'], complaint_id)
                )
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            path_params = event.get('pathParams', {})
            complaint_id = path_params.get('id')
            
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('DELETE FROM complaints WHERE id = %s', (complaint_id,))
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
