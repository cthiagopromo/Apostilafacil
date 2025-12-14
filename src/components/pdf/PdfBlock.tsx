import React from 'react';
import { Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import DOMPurify from 'dompurify';

// Function to strip HTML tags for now, as React-PDF doesn't support HTML string
const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>?/gm, '');
};

const styles = StyleSheet.create({
    blockWrapper: {
        marginBottom: 10,
    },
    text: {
        fontSize: 11,
        lineHeight: 1.5,
        fontFamily: 'Inter',
        marginBottom: 8,
    },
    imageContainer: {
        alignItems: 'center',
        marginVertical: 10,
    },
    image: {
        maxWidth: '100%',
        height: 'auto',
    },
    caption: {
        fontSize: 9,
        color: '#666',
        marginTop: 4,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    quote: {
        marginVertical: 10,
        paddingLeft: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#3b82f6',
        fontStyle: 'italic',
        color: '#4b5563',
    },
    quoteText: {
        fontSize: 11,
        marginBottom: 4,
    },
    quoteAuthor: {
        fontSize: 10,
        textAlign: 'right',
    },
    notice: {
        padding: 10,
        borderRadius: 4,
        marginVertical: 10,
        borderLeftWidth: 3,
    },
    noticeTitle: {
        fontWeight: 'bold',
        marginBottom: 4,
        fontSize: 11,
    },
    quiz: {
        padding: 12,
        backgroundColor: '#f9fafb',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginVertical: 10,
    },
    quizQuestion: {
        fontWeight: 'bold',
        marginBottom: 8,
        fontSize: 11,
    },
    quizOption: {
        marginBottom: 4,
        padding: 4,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 2,
        backgroundColor: 'white',
        fontSize: 10,
    }
});

interface BlockProps {
    block: any;
}

export const PdfBlock: React.FC<BlockProps> = ({ block }) => {
    switch (block.type) {
        case 'text':
            // Simplification: Stripping HTML for now. 
            // Ideally we'd map HTML tags to Text/View with formatting.
            return (
                <View style={styles.blockWrapper} wrap={false}>
                    <Text style={styles.text}>{stripHtml(block.content.text || '')}</Text>
                </View>
            );
        case 'image':
            return (
                <View style={styles.blockWrapper} wrap={false}>
                    <View style={styles.imageContainer}>
                        {/* eslint-disable-next-line jsx-a11y/alt-text */}
                        <Image src={block.content.url} style={styles.image} />
                        {block.content.caption && (
                            <Text style={styles.caption}>{block.content.caption}</Text>
                        )}
                    </View>
                </View>
            );
        case 'quote':
            return (
                <View style={[styles.blockWrapper, styles.quote]} wrap={false}>
                    <Text style={styles.quoteText}>{block.content.quote}</Text>
                    {block.content.author && <Text style={styles.quoteAuthor}>— {block.content.author}</Text>}
                </View>
            );
        case 'notice':
            const colors: any = {
                info: { bg: '#eff6ff', border: '#3b82f6' },
                warning: { bg: '#fef3c7', border: '#f59e0b' },
                success: { bg: '#d1fae5', border: '#10b981' },
                error: { bg: '#fee2e2', border: '#ef4444' },
            };
            const color = colors[block.content.type] || colors.info;

            return (
                <View style={[styles.blockWrapper, styles.notice, { backgroundColor: color.bg, borderLeftColor: color.border }]} wrap={false}>
                    {block.content.title && <Text style={styles.noticeTitle}>{block.content.title}</Text>}
                    <Text style={styles.text}>{stripHtml(block.content.content || '')}</Text>
                </View>
            );
        case 'quiz':
            return (
                <View style={[styles.blockWrapper, styles.quiz]} wrap={false}>
                    <Text style={styles.quizQuestion}>{block.content.question}</Text>
                    {block.content.options?.map((opt: any, idx: number) => (
                        <View key={idx} style={styles.quizOption}>
                            <Text>{String.fromCharCode(65 + idx)}) {opt.text}</Text>
                        </View>
                    ))}
                </View>
            );
        default:
            return null;
    }
};
